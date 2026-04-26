import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { runOrchestrator } from "@/agents/orchestrator";
import { listCases, loadCase, getCaseStatus, deleteCase } from "@/lib/storage/case-store";
import { DEMO_BUNDLES, isDemoCase } from "@/lib/storage/demo-bundle";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET() {
  const seen = new Set<string>();
  const cases: Array<Record<string, unknown>> = [];

  // First, the bundled demo cases (always available, even on Vercel)
  for (const [id, bundle] of Object.entries(DEMO_BUNDLES)) {
    cases.push({ ...bundle.case, status: bundle.status });
    seen.add(id);
  }

  // Then, any locally written cases (filesystem; works on localhost)
  for (const id of listCases()) {
    if (seen.has(id)) continue;
    const c = loadCase(id);
    if (!c) continue;
    cases.push({ ...c, status: getCaseStatus(id) });
  }

  cases.sort((a, b) => (b.uploadedAt as number) - (a.uploadedAt as number));
  return NextResponse.json({ cases });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope");
  if (scope !== "smoke-tests") {
    return NextResponse.json({ error: "Specify scope=smoke-tests" }, { status: 400 });
  }
  const ids = listCases().filter((id) => id.startsWith("test-") && !isDemoCase(id));
  let deleted = 0;
  for (const id of ids) {
    if (deleteCase(id)) deleted += 1;
  }
  return NextResponse.json({ deleted });
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";
  let title = "Untitled case";
  let text = "";
  const attachments: { name: string; base64?: string; mimeType: string }[] = [];

  if (contentType.includes("application/json")) {
    const body = await req.json();
    title = body.title ?? title;
    text = body.text ?? "";
  } else if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    title = (form.get("title") as string) ?? title;
    text = (form.get("text") as string) ?? "";
    const files = form.getAll("files") as File[];
    for (const f of files) {
      const buf = Buffer.from(await f.arrayBuffer());
      const isImage = f.type.startsWith("image/");
      if (isImage || f.type === "application/pdf") {
        attachments.push({
          name: f.name,
          mimeType: f.type,
          base64: buf.toString("base64"),
        });
      } else {
        text += "\n\n" + buf.toString("utf-8");
      }
    }
  } else {
    return NextResponse.json({ error: "Unsupported content type" }, { status: 400 });
  }

  if (!text.trim() && attachments.length === 0) {
    return NextResponse.json({ error: "No case content provided" }, { status: 400 });
  }

  const caseId = uuidv4();
  // Fire and forget — frontend listens via SSE for progress
  runOrchestrator({
    caseId,
    caseTitle: title,
    caseText: text,
    attachments,
    enableVision: attachments.length > 0,
    enableCritic: process.env.ENABLE_CRITIC_LOOP !== "false",
  }).catch((e) => {
    console.error("[orchestrator] failed", e);
  });

  return NextResponse.json({ caseId });
}
