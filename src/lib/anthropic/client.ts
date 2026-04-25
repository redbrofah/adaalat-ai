import Anthropic from "@anthropic-ai/sdk";
import { repairAndParseJson } from "./json-repair";

let _client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey.startsWith("PASTE-")) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set. Edit .env.local and paste your key from https://console.anthropic.com",
      );
    }
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

export const Models = {
  opus: process.env.MODEL_OPUS ?? "claude-opus-4-7",
  sonnet: process.env.MODEL_SONNET ?? "claude-sonnet-4-6",
  haiku: process.env.MODEL_HAIKU ?? "claude-haiku-4-5-20251001",
} as const;

export type ModelTier = keyof typeof Models;

export const PRICING_PER_MTOK: Record<string, { input: number; output: number }> = {
  "claude-opus-4-7": { input: 15, output: 75 },
  "claude-sonnet-4-6": { input: 3, output: 15 },
  "claude-haiku-4-5-20251001": { input: 0.8, output: 4 },
};

export function estimateCostUsd(model: string, tokensIn: number, tokensOut: number): number {
  const p = PRICING_PER_MTOK[model] ?? PRICING_PER_MTOK["claude-sonnet-4-6"];
  return (tokensIn / 1_000_000) * p.input + (tokensOut / 1_000_000) * p.output;
}

export interface InvokeOptions {
  model: ModelTier | string;
  systemPrompt: string;
  userMessage: string | Anthropic.Messages.MessageParam[];
  maxTokens?: number;
  thinkingBudget?: number;
  tools?: Anthropic.Messages.Tool[];
  cacheSystem?: boolean;
}

export async function invokeStream(opts: InvokeOptions) {
  const client = getAnthropic();
  const model = (Models[opts.model as ModelTier] ?? opts.model) as string;

  const systemBlocks: Anthropic.Messages.TextBlockParam[] = [
    {
      type: "text",
      text: opts.systemPrompt,
      ...(opts.cacheSystem ? { cache_control: { type: "ephemeral" } } : {}),
    },
  ];

  const messages: Anthropic.Messages.MessageParam[] =
    typeof opts.userMessage === "string"
      ? [{ role: "user", content: opts.userMessage }]
      : opts.userMessage;

  const requestBody: Anthropic.Messages.MessageCreateParamsStreaming = {
    model,
    system: systemBlocks,
    messages,
    max_tokens: opts.maxTokens ?? 8192,
    stream: true,
  };

  if (opts.thinkingBudget && opts.thinkingBudget > 0) {
    if (model.startsWith("claude-opus-4-7")) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (requestBody as any).thinking = { type: "adaptive" };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (requestBody as any).output_config = { effort: "high" };
    } else {
      requestBody.thinking = { type: "enabled", budget_tokens: opts.thinkingBudget };
    }
  }
  if (opts.tools && opts.tools.length > 0) {
    requestBody.tools = opts.tools;
  }

  return client.messages.stream(requestBody);
}

export async function invokeJson<T>(opts: InvokeOptions): Promise<{
  parsed: T;
  raw: string;
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
}> {
  const stream = await invokeStream(opts);
  let raw = "";
  let tokensIn = 0;
  let tokensOut = 0;

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      raw += event.delta.text;
    } else if (event.type === "message_delta" && event.usage) {
      tokensOut = event.usage.output_tokens ?? tokensOut;
    } else if (event.type === "message_start" && event.message.usage) {
      tokensIn = event.message.usage.input_tokens ?? 0;
    }
  }

  const parsed = repairAndParseJson<T>(raw);
  const model = (Models[opts.model as ModelTier] ?? opts.model) as string;
  const costUsd = estimateCostUsd(model, tokensIn, tokensOut);
  return { parsed, raw, tokensIn, tokensOut, costUsd };
}
