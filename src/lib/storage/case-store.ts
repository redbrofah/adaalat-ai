import fs from "fs";
import path from "path";
import type { CaseFile, AgentId, CaseStatus } from "@/lib/types";

const ROOT = process.env.UPLOADS_DIR ?? "./data/uploads";
const DEMO_ROOT = "./data/demo-cases";

const TRACKED_AGENTS: AgentId[] = [
  "vision",
  "classification",
  "conflict",
  "precedent",
  "deadline",
  "reasoning",
  "translation",
  "synthesis",
  "critic",
];

/**
 * Resolve which root directory holds a given case. Cases written by a live
 * orchestrator run go to ROOT; pre-bundled demo cases (committed in the repo)
 * live in DEMO_ROOT. ROOT is checked first so a re-processed demo case wins.
 */
function caseDir(caseId: string): string {
  const live = path.join(ROOT, caseId);
  if (fs.existsSync(live)) return live;
  const demo = path.join(DEMO_ROOT, caseId);
  if (fs.existsSync(demo)) return demo;
  return live; // default to live so writes target the right place
}

export function ensureCaseDir(caseId: string): string {
  const dir = path.join(ROOT, caseId);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function saveCase(caseFile: CaseFile): void {
  const dir = ensureCaseDir(caseFile.id);
  fs.writeFileSync(path.join(dir, "case.json"), JSON.stringify(caseFile, null, 2));
}

export function loadCase(caseId: string): CaseFile | null {
  const file = path.join(caseDir(caseId), "case.json");
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf-8")) as CaseFile;
}

export function saveAgentOutput(caseId: string, agent: AgentId, output: unknown): void {
  const dir = ensureCaseDir(caseId);
  fs.writeFileSync(
    path.join(dir, `${agent}.json`),
    JSON.stringify(output, null, 2),
  );
}

export function loadAgentOutput<T>(caseId: string, agent: AgentId): T | null {
  const file = path.join(caseDir(caseId), `${agent}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf-8")) as T;
}

export function listCases(): string[] {
  const ids = new Set<string>();
  for (const root of [ROOT, DEMO_ROOT]) {
    if (!fs.existsSync(root)) continue;
    for (const d of fs.readdirSync(root, { withFileTypes: true })) {
      if (d.isDirectory()) ids.add(d.name);
    }
  }
  return [...ids];
}

export function getCaseStatus(caseId: string): CaseStatus {
  const dir = caseDir(caseId);
  if (fs.existsSync(path.join(dir, "synthesis.json"))) return "complete";
  for (const agent of TRACKED_AGENTS) {
    if (fs.existsSync(path.join(dir, `${agent}.json`))) return "partial";
  }
  return "empty";
}

export function listAvailableAgentOutputs(caseId: string): AgentId[] {
  const dir = caseDir(caseId);
  return TRACKED_AGENTS.filter((a) => fs.existsSync(path.join(dir, `${a}.json`)));
}

export function deleteCase(caseId: string): boolean {
  const dir = path.join(ROOT, caseId);
  if (!fs.existsSync(dir)) return false;
  fs.rmSync(dir, { recursive: true, force: true });
  return true;
}
