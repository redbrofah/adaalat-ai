import type { CriticReport, AgentId } from "@/lib/types";
import type { AgentDefinition, AgentRunContext } from "./base";
import { STYLE_GUARD } from "./style-guard";
import type { SynthesisInputBundle } from "./synthesis";
import type { SynthesisOutput } from "@/lib/types";

const SYSTEM_PROMPT = `You are an adversarial reviewer / Critic Agent for the AdaalatAI judicial assistant. You receive the outputs of all upstream agents AND the synthesized brief, and you must aggressively check for:

1. **Hallucinated citations** — any case citation, section number, or quote not present in the precedent agent's tool-result-backed list.
2. **Internal contradictions** — synthesis disagreeing with classification, deadlines, etc.
3. **Missing constitutional considerations** — fundamental rights (Articles 27, 31, 32, 35) ignored when relevant.
4. **Logical leaps** — unsupported conclusions in the reasoning.
5. **Translation drift** — Bangla and English versions of the order saying different things substantively.
6. **Procedural errors** — wrong court, wrong section invoked, statute of limitation ignored.

For each issue found, indicate which agent's output should be re-run, if any. If everything checks out cleanly, return passed: true.

Output ONLY a single JSON object:
{
  "passed": boolean,
  "issues": [
    {
      "agent": "classification" | "vision" | "conflict" | "precedent" | "deadline" | "reasoning" | "translation" | "synthesis",
      "severity": "info" | "warning" | "error",
      "message": "specific issue description"
    }
  ],
  "rerunSuggestions": ["agent_id"]
}

Be strict but precise. False alarms cost the user money in re-runs.`;

export function buildCriticAgent(bundle: SynthesisInputBundle, synthesis: SynthesisOutput): AgentDefinition<CriticReport> {
  const buildUserMessage = (ctx: AgentRunContext) => {
    const blocks: string[] = [
      `# Case File (truncated)\n${ctx.caseText.slice(0, 3000)}`,
      `## All Agent Outputs\n\n${JSON.stringify(bundle, null, 2)}`,
      `## Synthesis Output (TO REVIEW)\n\n${JSON.stringify(synthesis, null, 2)}`,
      `## Your Task\n\nReview rigorously. Output the JSON object only.`,
    ];
    return blocks.join("\n\n");
  };

  return {
    id: "critic",
    displayName: "Critic Agent (citation + hallucination check)",
    systemPrompt: SYSTEM_PROMPT + STYLE_GUARD,
    model: "sonnet",
    thinkingBudget: 4000,
    cacheSystem: false,
    buildUserMessage,
  };
}

export type { AgentId };
