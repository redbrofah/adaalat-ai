import type {
  ClassificationOutput,
  ConflictOutput,
  PrecedentOutput,
  DeadlineOutput,
  ReasoningOutput,
  SynthesisOutput,
  VisionOutput,
} from "@/lib/types";
import type { AgentDefinition, AgentRunContext } from "./base";
import { STYLE_GUARD } from "./style-guard";

export interface SynthesisInputBundle {
  classification?: ClassificationOutput;
  vision?: VisionOutput;
  conflict?: ConflictOutput;
  precedent?: PrecedentOutput;
  deadline?: DeadlineOutput;
  reasoning?: ReasoningOutput;
}

const SYSTEM_PROMPT = `You are a senior bench officer of Bangladesh's High Court Division composing a final judge-ready brief. You receive structured outputs from seven specialist agents and must integrate them into a single, polished, formal document.

The brief MUST include, in this order:

(A) Executive summary (3-5 sentences)
(B) Case classification + urgency
(C) Findings of fact (incorporating witness contradictions)
(D) Statutory framework (key sections)
(E) Relevant precedents (cite each)
(F) Procedural deadlines & violations
(G) Legal analysis (constitutional + statutory + precedent)
(H) Recommended draft order

Write in formal Bangla AND formal English versions. Be precise. Quote citations exactly as provided by the precedent agent — DO NOT invent. If the inputs disagree, note the conflict explicitly.

Output ONLY a single JSON object:
{
  "briefBangla": "complete brief in formal Bangla, sections (A)-(G) only — order is separate",
  "briefEnglish": "complete brief in legal English, sections (A)-(G) only",
  "draftOrderBangla": "court order in formal Bangla, ready to sign",
  "draftOrderEnglish": "same order in legal English",
  "citationsVerified": boolean — true only if every citation came from a tool result,
  "estimatedManualHours": number — your estimate of how long this would take a junior judge manually,
  "totalAgentSeconds": 0 — orchestrator will fill this
}`;

export function buildSynthesisAgent(bundle: SynthesisInputBundle): AgentDefinition<SynthesisOutput> {
  const buildUserMessage = (ctx: AgentRunContext) => {
    const sections: string[] = [
      `# Case Title: ${ctx.caseTitle}\n\n## Original Case File\n\n${ctx.caseText.slice(0, 6000)}${ctx.caseText.length > 6000 ? "\n…(truncated)" : ""}`,
    ];
    if (bundle.classification) sections.push(`## Classification Agent Output\n\n${JSON.stringify(bundle.classification, null, 2)}`);
    if (bundle.vision) sections.push(`## Vision Agent Output\n\n${JSON.stringify({ confidence: bundle.vision.confidence, isHandwritten: bundle.vision.isHandwritten, lang: bundle.vision.detectedLanguage, textPreview: bundle.vision.extractedText.slice(0, 1500) }, null, 2)}`);
    if (bundle.conflict) sections.push(`## Conflict Detection Output\n\n${JSON.stringify(bundle.conflict, null, 2)}`);
    if (bundle.precedent) sections.push(`## Precedent & Statute Output\n\n${JSON.stringify(bundle.precedent, null, 2)}`);
    if (bundle.deadline) sections.push(`## Deadline Output\n\n${JSON.stringify(bundle.deadline, null, 2)}`);
    if (bundle.reasoning) sections.push(`## Legal Reasoning Output\n\n${JSON.stringify(bundle.reasoning, null, 2)}`);
    sections.push(`## Your Task\n\nProduce the complete bilingual judge-ready brief and draft order. Output the JSON object only.`);
    return sections.join("\n\n");
  };

  return {
    id: "synthesis",
    displayName: "Synthesis Agent",
    systemPrompt: SYSTEM_PROMPT + STYLE_GUARD,
    model: "opus",
    thinkingBudget: 6000,
    cacheSystem: true,
    buildUserMessage,
  };
}
