import { NextRequest, NextResponse } from "next/server";
import {
  loadCase,
  loadAgentOutput,
  listAvailableAgentOutputs,
  getCaseStatus,
  deleteCase,
} from "@/lib/storage/case-store";
import { getDemoBundle, isDemoCase } from "@/lib/storage/demo-bundle";
import type { AgentId } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

const ALL_AGENTS: AgentId[] = [
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

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const demo = getDemoBundle(params.id);
  if (demo) {
    return NextResponse.json({
      case: demo.case,
      outputs: demo.outputs,
      status: demo.status,
      availableAgents: demo.availableAgents,
    });
  }

  const caseFile = loadCase(params.id);
  if (!caseFile) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const outputs: Record<string, unknown> = {};
  for (const agent of ALL_AGENTS) {
    const out = loadAgentOutput(params.id, agent);
    if (out) outputs[agent] = out;
  }
  return NextResponse.json({
    case: caseFile,
    outputs,
    status: getCaseStatus(params.id),
    availableAgents: listAvailableAgentOutputs(params.id),
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (isDemoCase(params.id)) {
    return NextResponse.json({ error: "demo cases cannot be deleted" }, { status: 403 });
  }
  const ok = deleteCase(params.id);
  if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ deleted: params.id });
}
