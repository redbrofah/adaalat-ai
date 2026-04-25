import { v4 as uuidv4 } from "uuid";
import { runAgent } from "./base";
import { classificationAgent } from "./classification";
import { conflictAgent } from "./conflict";
import { precedentAgent } from "./precedent";
import { deadlineAgent } from "./deadline";
import { reasoningAgent } from "./reasoning";
import { visionAgent } from "./vision";
import { buildSynthesisAgent, type SynthesisInputBundle } from "./synthesis";
import { buildCriticAgent } from "./critic";
import { publish } from "@/lib/streaming/event-bus";
import { saveCase } from "@/lib/storage/case-store";
import type { CaseFile, SynthesisOutput, BudgetSnapshot } from "@/lib/types";

export interface OrchestratorInput {
  caseId?: string;
  caseTitle: string;
  caseText: string;
  attachments?: { name: string; base64?: string; mimeType: string }[];
  enableVision?: boolean;
  enableCritic?: boolean;
}

export interface OrchestratorResult {
  caseId: string;
  synthesis: SynthesisOutput;
  budget: BudgetSnapshot;
  totalSeconds: number;
}

const PARALLEL_STAGGER_MS = 1500;
const stagger = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function runOrchestrator(input: OrchestratorInput): Promise<OrchestratorResult> {
  const caseId = input.caseId ?? uuidv4();
  const startedAt = Date.now();

  const caseFile: CaseFile = {
    id: caseId,
    title: input.caseTitle,
    uploadedAt: startedAt,
    files: [],
    rawText: input.caseText,
    language: "mixed",
  };
  saveCase(caseFile);

  publish({
    caseId,
    agent: "orchestrator",
    status: "running",
    startedAt,
    messageRef: { key: "orch.started", params: { title: input.caseTitle } },
  });

  const ctx = {
    caseId,
    caseTitle: input.caseTitle,
    caseText: input.caseText,
    attachments: input.attachments,
  };

  const budget: BudgetSnapshot = {
    totalTokensIn: 0,
    totalTokensOut: 0,
    totalCostUsd: 0,
    perAgentCostUsd: {},
  };

  const accumulate = (agent: string, t: { tokensIn: number; tokensOut: number; costUsd: number }) => {
    budget.totalTokensIn += t.tokensIn;
    budget.totalTokensOut += t.tokensOut;
    budget.totalCostUsd += t.costUsd;
    const id = agent as keyof typeof budget.perAgentCostUsd;
    budget.perAgentCostUsd[id] = (budget.perAgentCostUsd[id] ?? 0) + t.costUsd;
  };

  // Step 1: Vision (sequential, produces text used by others)
  let visionEnriched = input.caseText;
  const visionEnabled = input.enableVision !== false && (input.attachments ?? []).some((a) => a.base64);
  let visionOut;
  if (visionEnabled) {
    const vision = await runAgent(visionAgent, ctx);
    accumulate("vision", vision);
    visionOut = vision.output;
    visionEnriched = `${input.caseText}\n\n## OCR Extracted Text\n${vision.output.extractedText}`;
  }

  const enrichedCtx = { ...ctx, caseText: visionEnriched };

  // Step 2: 5 agents cascade-parallel (1.5s stagger between starts)
  publish({
    caseId,
    agent: "orchestrator",
    status: "running",
    messageRef: { key: "orch.parallelLaunch" },
  });

  const parallel = await Promise.allSettled([
    runAgent(classificationAgent, enrichedCtx),
    stagger(PARALLEL_STAGGER_MS).then(() => runAgent(conflictAgent, enrichedCtx)),
    stagger(PARALLEL_STAGGER_MS * 2).then(() => runAgent(precedentAgent, enrichedCtx)),
    stagger(PARALLEL_STAGGER_MS * 3).then(() => runAgent(deadlineAgent, enrichedCtx)),
    stagger(PARALLEL_STAGGER_MS * 4).then(() => runAgent(reasoningAgent, enrichedCtx)),
  ]);

  const [classificationRes, conflictRes, precedentRes, deadlineRes, reasoningRes] = parallel;

  const get = <T>(r: typeof parallel[number]): T | undefined => {
    if (r.status === "fulfilled") {
      accumulate("any", { tokensIn: r.value.tokensIn, tokensOut: r.value.tokensOut, costUsd: r.value.costUsd });
      return r.value.output as T;
    }
    return undefined;
  };

  const bundle: SynthesisInputBundle = {
    vision: visionOut,
    classification: get(classificationRes),
    conflict: get(conflictRes),
    precedent: get(precedentRes),
    deadline: get(deadlineRes),
    reasoning: get(reasoningRes),
  };

  // Step 3: Synthesis
  publish({
    caseId,
    agent: "orchestrator",
    status: "running",
    messageRef: { key: "orch.synthesisStart" },
  });
  const synthAgent = buildSynthesisAgent(bundle);
  const synth = await runAgent(synthAgent, enrichedCtx);
  accumulate("synthesis", synth);

  // Step 4: Critic (optional)
  let synthesis = synth.output;
  if (input.enableCritic !== false) {
    publish({
      caseId,
      agent: "orchestrator",
      status: "running",
      messageRef: { key: "orch.criticStart" },
    });
    const criticAgent = buildCriticAgent(bundle, synthesis);
    try {
      const critic = await runAgent(criticAgent, enrichedCtx);
      accumulate("critic", critic);
      if (!critic.output.passed && critic.output.issues.length > 0) {
        publish({
          caseId,
          agent: "orchestrator",
          status: "running",
          messageRef: { key: "orch.criticFlagged", params: { n: critic.output.issues.length } },
        });
      }
    } catch (e) {
      console.error("[orchestrator] critic failed", e);
    }
  }

  const completedAt = Date.now();
  const totalSeconds = (completedAt - startedAt) / 1000;
  synthesis = { ...synthesis, totalAgentSeconds: totalSeconds };

  publish({
    caseId,
    agent: "orchestrator",
    status: "done",
    startedAt,
    completedAt,
    finalOutput: synthesis,
    messageRef: {
      key: "orch.done",
      params: { secs: totalSeconds.toFixed(1), cost: budget.totalCostUsd.toFixed(3) },
    },
    costUsd: budget.totalCostUsd,
    tokensIn: budget.totalTokensIn,
    tokensOut: budget.totalTokensOut,
  });

  return { caseId, synthesis, budget, totalSeconds };
}
