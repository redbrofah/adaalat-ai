import fs from "fs";
import path from "path";
import type { CaseFile, AgentId, CaseStatus } from "@/lib/types";

const ROOT = process.env.UPLOADS_DIR ?? "./data/uploads";

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

function caseDir(caseId: string) {
  return path.join(ROOT, caseId);
}

export function ensureCaseDir(caseId: string): string {
  const dir = caseDir(caseId);
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
  if (!fs.existsSync(ROOT)) return [];
  return fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
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
  const dir = caseDir(caseId);
  if (!fs.existsSync(dir)) return false;
  fs.rmSync(dir, { recursive: true, force: true });
  return true;
}
