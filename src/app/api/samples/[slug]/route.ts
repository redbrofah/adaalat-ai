import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

const CASES_DIR = "./data/cases";

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const file = path.join(CASES_DIR, `${params.slug}.md`);
  if (!fs.existsSync(file)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const text = fs.readFileSync(file, "utf-8");
  return NextResponse.json({ slug: params.slug, text });
}
