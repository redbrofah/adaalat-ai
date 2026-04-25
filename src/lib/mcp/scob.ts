import fs from "fs";
import path from "path";

export interface ScobChunk {
  source: string;
  page: number;
  text: string;
}

export interface PrecedentSearchResult {
  citation: string;
  source: string;
  page: number;
  snippet: string;
  relevanceScore: number;
  fullChunk: string;
}

const SCOB_DIR = process.env.SCOB_DIR ?? "./data/scob-pdfs";
const INDEX_FILE = path.join(process.env.LANCEDB_DIR ?? "./data/index/lancedb", "scob-text-index.json");

let _cache: ScobChunk[] | null = null;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

function score(query: string, text: string): number {
  const q = tokenize(query);
  const t = text.toLowerCase();
  let s = 0;
  for (const term of q) {
    const matches = t.split(term).length - 1;
    s += matches * (term.length > 4 ? 2 : 1);
  }
  if (t.includes(query.toLowerCase())) s += 15;
  return s;
}

function loadCache(): ScobChunk[] {
  if (_cache) return _cache;
  if (fs.existsSync(INDEX_FILE)) {
    _cache = JSON.parse(fs.readFileSync(INDEX_FILE, "utf-8")) as ScobChunk[];
    return _cache;
  }
  console.warn(
    `[scob] Index not built yet. Run "npm run index:scob" to extract text from PDFs in ${SCOB_DIR}`,
  );
  _cache = [];
  return _cache;
}

export function searchScobPrecedents(
  query: string,
  options: { caseType?: string; limit?: number } = {},
): PrecedentSearchResult[] {
  const chunks = loadCache();
  const limit = options.limit ?? 5;
  const filterTerm = options.caseType?.toLowerCase();

  const scored = chunks
    .map((c) => {
      let s = score(query, c.text);
      if (filterTerm && c.text.toLowerCase().includes(filterTerm)) s += 5;
      return {
        chunk: c,
        score: s,
      };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(({ chunk, score: relScore }) => {
    const citationMatch = chunk.text.match(
      /(\d+\s*SCOB\s*\(\s*\d{4}\s*\)\s*[A-Z]+\s*\d+)|((\d+\s*BLD\s*\(\s*\d{4}\s*\)\s*\d+))/i,
    );
    const citation = citationMatch
      ? citationMatch[0]
      : `${path.basename(chunk.source, ".pdf")} p.${chunk.page}`;
    return {
      citation,
      source: path.basename(chunk.source),
      page: chunk.page,
      snippet: chunk.text.slice(0, 320) + (chunk.text.length > 320 ? "…" : ""),
      relevanceScore: relScore,
      fullChunk: chunk.text,
    };
  });
}

export function getJudgmentFullText(citation: string): { source: string; matches: ScobChunk[] } | null {
  const chunks = loadCache();
  const matches = chunks.filter(
    (c) => c.text.toLowerCase().includes(citation.toLowerCase()),
  );
  if (matches.length === 0) return null;
  return { source: matches[0]!.source, matches };
}

export function getScobStatus(): { indexed: boolean; chunkCount: number; pdfCount: number } {
  const chunks = loadCache();
  let pdfCount = 0;
  if (fs.existsSync(SCOB_DIR)) {
    pdfCount = fs.readdirSync(SCOB_DIR).filter((f) => f.endsWith(".pdf")).length;
  }
  return { indexed: chunks.length > 0, chunkCount: chunks.length, pdfCount };
}
