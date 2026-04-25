import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

const CASES_DIR = "./data/cases";

const TITLE_BN: Record<string, string> = {
  family_case_case_file: "পারিবারিক মামলা: ভরণপোষণ ও খোরপোষ বিরোধ",
  land_dispute_case_case_file: "জমির বিরোধ: ১৫ বছরের পুরোনো সম্পত্তি বিতর্ক",
  drug_case_case_file: "মাদক মামলা: Narcotics Control Act লঙ্ঘন",
  domestic_violence_case_case_file: "নারী নির্যাতন: DV Act 2010",
  constitutional_case_case_file: "Constitutional Case: Writ Petition",
};

const TITLE_EN: Record<string, string> = {
  family_case_case_file: "Family suit: maintenance and alimony",
  land_dispute_case_case_file: "Land dispute: 15-year-old property conflict",
  drug_case_case_file: "Narcotics case: Narcotics Control Act violation",
  domestic_violence_case_case_file: "Domestic violence: DV Act 2010",
  constitutional_case_case_file: "Constitutional case: writ petition",
};

export async function GET() {
  if (!fs.existsSync(CASES_DIR)) {
    return NextResponse.json({ samples: [] });
  }
  const files = fs.readdirSync(CASES_DIR).filter((f) => f.endsWith(".md"));
  const samples = files.map((f) => {
    const slug = f.replace(/\.md$/, "");
    const text = fs.readFileSync(path.join(CASES_DIR, f), "utf-8");
    return {
      slug,
      titleEn: TITLE_EN[slug] ?? slug,
      titleBn: TITLE_BN[slug] ?? slug,
      preview: text.split("\n").slice(0, 3).join("\n"),
      size: text.length,
    };
  });
  return NextResponse.json({ samples });
}
