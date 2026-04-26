import { NextRequest, NextResponse } from "next/server";
import { loadCase } from "@/lib/storage/case-store";
import { runOrchestrator } from "@/agents/orchestrator";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const caseFile = loadCase(params.id);
  if (!caseFile) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  runOrchestrator({
    caseId: caseFile.id,
    caseTitle: caseFile.title,
    caseText: caseFile.rawText,
    enableVision: false,
    enableCritic: process.env.ENABLE_CRITIC_LOOP !== "false",
  }).catch((e) => {
    console.error("[reprocess] failed", e);
  });

  return NextResponse.json({ caseId: caseFile.id, restarted: true });
}
