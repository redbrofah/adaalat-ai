import { invokeJson, estimateCostUsd, Models } from "@/lib/anthropic/client";
import { publish } from "@/lib/streaming/event-bus";
import { saveAgentOutput } from "@/lib/storage/case-store";
import { sanitizeDeep } from "@/lib/text/sanitize";
import type { AgentId } from "@/lib/types";
import type Anthropic from "@anthropic-ai/sdk";

const THINKING_INTERVAL_MS = 7000;

function startThinkingTicker(caseId: string, agentId: AgentId) {
  let idx = 0;
  const handle = setInterval(() => {
    publish({
      caseId,
      agent: agentId,
      status: "running",
      messageRef: { key: `agentThinking.${agentId}`, params: { idx } },
    });
    idx += 1;
  }, THINKING_INTERVAL_MS);
  return () => clearInterval(handle);
}

export interface AgentRunContext {
  caseId: string;
  caseText: string;
  caseTitle: string;
  attachments?: { name: string; base64?: string; mimeType: string }[];
}

export interface AgentDefinition<TOutput> {
  id: AgentId;
  displayName: string;
  systemPrompt: string;
  model: "opus" | "sonnet" | "haiku";
  thinkingBudget?: number;
  buildUserMessage: (ctx: AgentRunContext) => string | Anthropic.Messages.MessageParam[];
  tools?: Anthropic.Messages.Tool[];
  toolHandlers?: Record<string, (input: Record<string, unknown>) => Promise<unknown>>;
  cacheSystem?: boolean;
  parseOutput?: (raw: string) => TOutput;
}

export async function runAgent<TOutput>(
  def: AgentDefinition<TOutput>,
  ctx: AgentRunContext,
): Promise<{ output: TOutput; tokensIn: number; tokensOut: number; costUsd: number }> {
  const startedAt = Date.now();
  publish({
    caseId: ctx.caseId,
    agent: def.id,
    status: "running",
    startedAt,
    messageRef: { key: "agentLifecycle.started", params: { name: def.displayName } },
  });
  const stopThinking = startThinkingTicker(ctx.caseId, def.id);

  try {
    if (def.tools && def.tools.length > 0 && def.toolHandlers) {
      const result = await runWithTools(def, ctx, startedAt);
      stopThinking();
      return result;
    }

    const userMsg = def.buildUserMessage(ctx);
    const isOpus = def.model === "opus";
    const maxTokens = def.id === "synthesis" ? 16384 : isOpus ? 12000 : 8192;
    const result = await invokeJson<TOutput>({
      model: def.model,
      systemPrompt: def.systemPrompt,
      userMessage: userMsg,
      maxTokens,
      thinkingBudget: def.thinkingBudget,
      cacheSystem: def.cacheSystem,
    });

    stopThinking();
    const sanitized = sanitizeDeep(result.parsed);
    const completedAt = Date.now();
    saveAgentOutput(ctx.caseId, def.id, sanitized);
    publish({
      caseId: ctx.caseId,
      agent: def.id,
      status: "done",
      startedAt,
      completedAt,
      finalOutput: sanitized,
      tokensIn: result.tokensIn,
      tokensOut: result.tokensOut,
      costUsd: result.costUsd,
      messageRef: {
        key: "agentLifecycle.done",
        params: { name: def.displayName, secs: ((completedAt - startedAt) / 1000).toFixed(1) },
      },
    });
    return {
      output: sanitized,
      tokensIn: result.tokensIn,
      tokensOut: result.tokensOut,
      costUsd: result.costUsd,
    };
  } catch (e) {
    stopThinking();
    const completedAt = Date.now();
    const errMsg = e instanceof Error ? e.message : String(e);
    publish({
      caseId: ctx.caseId,
      agent: def.id,
      status: "error",
      startedAt,
      completedAt,
      error: errMsg,
      messageRef: {
        key: "agentLifecycle.failed",
        params: { name: def.displayName, err: errMsg.slice(0, 120) },
      },
    });
    throw e;
  }
}

async function runWithTools<TOutput>(
  def: AgentDefinition<TOutput>,
  ctx: AgentRunContext,
  startedAt: number,
): Promise<{ output: TOutput; tokensIn: number; tokensOut: number; costUsd: number }> {
  const { getAnthropic } = await import("@/lib/anthropic/client");
  const client = getAnthropic();
  const model = Models[def.model];

  const initialUserMsg = def.buildUserMessage(ctx);
  const messages: Anthropic.Messages.MessageParam[] =
    typeof initialUserMsg === "string"
      ? [{ role: "user", content: initialUserMsg }]
      : initialUserMsg;

  let totalIn = 0;
  let totalOut = 0;
  let finalText = "";

  const maxTurns = def.id === "precedent" ? 12 : 6;
  for (let turn = 0; turn < maxTurns; turn++) {
    const requestParams: Record<string, unknown> = {
      model,
      system: [
        {
          type: "text",
          text: def.systemPrompt,
          ...(def.cacheSystem ? { cache_control: { type: "ephemeral" } } : {}),
        },
      ],
      messages,
      max_tokens: 8192,
      tools: def.tools!,
    };
    if (def.thinkingBudget) {
      if (model.startsWith("claude-opus-4-7")) {
        requestParams.thinking = { type: "adaptive" };
        requestParams.output_config = { effort: "high" };
      } else {
        requestParams.thinking = { type: "enabled", budget_tokens: def.thinkingBudget };
      }
    }
    const response = (await client.messages.create(
      requestParams as unknown as Anthropic.Messages.MessageCreateParamsNonStreaming,
    )) as Anthropic.Messages.Message;
    totalIn += response.usage.input_tokens;
    totalOut += response.usage.output_tokens;

    const toolUses = response.content.filter(
      (b): b is Anthropic.Messages.ToolUseBlock => b.type === "tool_use",
    );
    const textBlocks = response.content.filter(
      (b): b is Anthropic.Messages.TextBlock => b.type === "text",
    );
    finalText = textBlocks.map((t) => t.text).join("\n");

    if (toolUses.length === 0 || response.stop_reason === "end_turn") {
      break;
    }

    messages.push({ role: "assistant", content: response.content });
    const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];
    for (const use of toolUses) {
      const handler = def.toolHandlers![use.name];
      publish({
        caseId: ctx.caseId,
        agent: def.id,
        status: "running",
        toolCall: { name: use.name, args: use.input as Record<string, unknown> },
        messageRef: {
          key: "agentLifecycle.toolCall",
          params: {
            name: def.displayName,
            tool: use.name,
            preview: JSON.stringify(use.input).slice(0, 80),
          },
        },
      });
      try {
        const result = handler ? await handler(use.input as Record<string, unknown>) : { error: "no handler" };
        const previewStr = JSON.stringify(result).slice(0, 200);
        publish({
          caseId: ctx.caseId,
          agent: def.id,
          status: "running",
          toolResult: { name: use.name, preview: previewStr },
        });
        toolResults.push({
          type: "tool_result",
          tool_use_id: use.id,
          content: JSON.stringify(result).slice(0, 8000),
        });
      } catch (e) {
        toolResults.push({
          type: "tool_result",
          tool_use_id: use.id,
          content: `Error: ${e instanceof Error ? e.message : String(e)}`,
          is_error: true,
        });
      }
    }
    messages.push({ role: "user", content: toolResults });
  }

  const { repairAndParseJson } = await import("@/lib/anthropic/json-repair");
  const parsed = repairAndParseJson<TOutput>(finalText);
  const sanitized = sanitizeDeep(parsed);

  const completedAt = Date.now();
  const costUsd = estimateCostUsd(model, totalIn, totalOut);
  saveAgentOutput(ctx.caseId, def.id, sanitized);
  publish({
    caseId: ctx.caseId,
    agent: def.id,
    status: "done",
    startedAt,
    completedAt,
    finalOutput: sanitized,
    tokensIn: totalIn,
    tokensOut: totalOut,
    costUsd,
    messageRef: {
      key: "agentLifecycle.done",
      params: { name: def.displayName, secs: ((completedAt - startedAt) / 1000).toFixed(1) },
    },
  });
  return { output: sanitized, tokensIn: totalIn, tokensOut: totalOut, costUsd };
}
