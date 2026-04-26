import demoCase from "../../../data/demo-cases/acbe85cb-0d21-4e1c-b4f6-42c7ca82fe4c/case.json";
import demoClassification from "../../../data/demo-cases/acbe85cb-0d21-4e1c-b4f6-42c7ca82fe4c/classification.json";
import demoConflict from "../../../data/demo-cases/acbe85cb-0d21-4e1c-b4f6-42c7ca82fe4c/conflict.json";
import demoDeadline from "../../../data/demo-cases/acbe85cb-0d21-4e1c-b4f6-42c7ca82fe4c/deadline.json";
import demoReasoning from "../../../data/demo-cases/acbe85cb-0d21-4e1c-b4f6-42c7ca82fe4c/reasoning.json";
import demoSynthesis from "../../../data/demo-cases/acbe85cb-0d21-4e1c-b4f6-42c7ca82fe4c/synthesis.json";
import demoCritic from "../../../data/demo-cases/acbe85cb-0d21-4e1c-b4f6-42c7ca82fe4c/critic.json";
import type { CaseFile, AgentId } from "@/lib/types";

export interface DemoCaseBundle {
  case: CaseFile;
  outputs: Partial<Record<AgentId, unknown>>;
  status: "complete";
  availableAgents: AgentId[];
}

const DEMO_CASE_ID = "acbe85cb-0d21-4e1c-b4f6-42c7ca82fe4c";

const bundle: DemoCaseBundle = {
  case: demoCase as unknown as CaseFile,
  outputs: {
    classification: demoClassification,
    conflict: demoConflict,
    deadline: demoDeadline,
    reasoning: demoReasoning,
    synthesis: demoSynthesis,
    critic: demoCritic,
  },
  status: "complete",
  availableAgents: ["classification", "conflict", "deadline", "reasoning", "synthesis", "critic"],
};

export const DEMO_BUNDLES: Record<string, DemoCaseBundle> = {
  [DEMO_CASE_ID]: bundle,
};

export function isDemoCase(caseId: string): boolean {
  return caseId in DEMO_BUNDLES;
}

export function getDemoBundle(caseId: string): DemoCaseBundle | null {
  return DEMO_BUNDLES[caseId] ?? null;
}

export function listDemoCaseIds(): string[] {
  return Object.keys(DEMO_BUNDLES);
}
