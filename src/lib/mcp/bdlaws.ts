import fs from "fs";
import path from "path";

export interface ActSection {
  section_content: string;
  section_number?: string;
}

export interface Act {
  act_title: string;
  act_no: string;
  act_year: string;
  sections: ActSection[];
  footnotes?: { footnote_text: string }[];
  source_url?: string;
  language?: string;
  legal_system_context?: unknown;
  csv_metadata?: { is_repealed?: boolean };
}

export interface ActSearchResult {
  actName: string;
  actNo: string;
  actYear: string;
  matchedSection: string;
  matchedSnippet: string;
  relevanceScore: number;
  sourceUrl?: string;
  isRepealed: boolean;
}

const BDLAWS_DIR = process.env.BDLAWS_DIR ?? "./data/bdlaws/acts";

let _cache: Act[] | null = null;

function cleanTitle(title: string): string {
  return title.replace(/^\d+/, "").trim();
}

export function loadAllActs(): Act[] {
  if (_cache) return _cache;
  if (!fs.existsSync(BDLAWS_DIR)) {
    console.warn(`[bdlaws] Directory not found: ${BDLAWS_DIR}`);
    _cache = [];
    return _cache;
  }
  const files = fs.readdirSync(BDLAWS_DIR).filter((f) => f.endsWith(".json"));
  const acts: Act[] = [];
  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(BDLAWS_DIR, file), "utf-8");
      const act = JSON.parse(raw) as Act;
      if (act.act_title) {
        act.act_title = cleanTitle(act.act_title);
        acts.push(act);
      }
    } catch {
      // ignore malformed files
    }
  }
  _cache = acts;
  return acts;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

function score(query: string, text: string): number {
  const q = tokenize(query);
  const t = text.toLowerCase();
  let s = 0;
  for (const term of q) {
    const matches = t.split(term).length - 1;
    s += matches * (term.length > 4 ? 2 : 1);
  }
  if (t.includes(query.toLowerCase())) s += 10;
  return s;
}

function snippet(text: string, query: string, length = 240): string {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text.slice(0, length);
  const start = Math.max(0, idx - 60);
  return (start > 0 ? "…" : "") + text.slice(start, start + length) + (text.length > start + length ? "…" : "");
}

export function searchBdlaws(
  query: string,
  options: { yearRange?: [number, number]; limit?: number; includeRepealed?: boolean } = {},
): ActSearchResult[] {
  const acts = loadAllActs();
  const [yMin, yMax] = options.yearRange ?? [0, 9999];
  const limit = options.limit ?? 10;

  const results: ActSearchResult[] = [];
  for (const act of acts) {
    const year = parseInt(act.act_year ?? "0", 10) || 0;
    if (year < yMin || year > yMax) continue;
    const isRepealed = act.csv_metadata?.is_repealed ?? false;
    if (isRepealed && !options.includeRepealed) continue;

    const titleScore = score(query, act.act_title) * 3;
    let bestSection = "";
    let bestSectionScore = 0;
    for (const sec of act.sections ?? []) {
      const sScore = score(query, sec.section_content);
      if (sScore > bestSectionScore) {
        bestSectionScore = sScore;
        bestSection = sec.section_content;
      }
    }
    const totalScore = titleScore + bestSectionScore;
    if (totalScore <= 0) continue;
    results.push({
      actName: act.act_title,
      actNo: act.act_no,
      actYear: act.act_year,
      matchedSection: bestSection.slice(0, 80),
      matchedSnippet: snippet(bestSection || act.act_title, query),
      relevanceScore: totalScore,
      sourceUrl: act.source_url,
      isRepealed,
    });
  }
  results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return results.slice(0, limit);
}

export function getActSection(actName: string, sectionQuery: string): {
  actName: string;
  actYear: string;
  sections: { content: string; matched: boolean }[];
  sourceUrl?: string;
} | null {
  const acts = loadAllActs();
  const target = acts.find((a) =>
    a.act_title.toLowerCase().includes(actName.toLowerCase()),
  );
  if (!target) return null;
  return {
    actName: target.act_title,
    actYear: target.act_year,
    sections: (target.sections ?? []).map((s) => ({
      content: s.section_content,
      matched: s.section_content.toLowerCase().includes(sectionQuery.toLowerCase()),
    })),
    sourceUrl: target.source_url,
  };
}

export function listAllActs(): { actName: string; actYear: string; isRepealed: boolean }[] {
  return loadAllActs().map((a) => ({
    actName: a.act_title,
    actYear: a.act_year,
    isRepealed: a.csv_metadata?.is_repealed ?? false,
  }));
}
