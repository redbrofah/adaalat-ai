/**
 * Indexes SCOB PDFs into a JSON text-index file for keyword search.
 * Uses pdf-parse v2 PDFParse class to extract text per-page.
 *
 * Usage: npm run index:scob
 */
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { PDFParse } from "pdf-parse";

dotenv.config({ path: ".env.local" });

const SCOB_DIR = process.env.SCOB_DIR ?? "./data/scob-pdfs";
const INDEX_DIR = process.env.LANCEDB_DIR ?? "./data/index/lancedb";
const INDEX_FILE = path.join(INDEX_DIR, "scob-text-index.json");

const CHUNK_SIZE = 1500;
const CHUNK_OVERLAP = 200;

interface Chunk {
  source: string;
  page: number;
  text: string;
}

function chunkText(text: string, source: string, page: number): Chunk[] {
  const chunks: Chunk[] = [];
  let i = 0;
  while (i < text.length) {
    const end = Math.min(i + CHUNK_SIZE, text.length);
    chunks.push({ source, page, text: text.slice(i, end).trim() });
    if (end >= text.length) break;
    i = end - CHUNK_OVERLAP;
  }
  return chunks;
}

async function main() {
  if (!fs.existsSync(SCOB_DIR)) {
    console.error(`SCOB directory not found: ${SCOB_DIR}`);
    process.exit(1);
  }
  fs.mkdirSync(INDEX_DIR, { recursive: true });

  const pdfFiles = fs.readdirSync(SCOB_DIR).filter((f) => f.endsWith(".pdf"));
  console.log(`Found ${pdfFiles.length} SCOB PDFs to index.\n`);

  const allChunks: Chunk[] = [];
  for (const file of pdfFiles) {
    const fullPath = path.join(SCOB_DIR, file);
    console.log(`  Parsing ${file}...`);
    try {
      const buffer = fs.readFileSync(fullPath);
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      const result = await parser.getText();
      const pages = result.pages ?? [];
      let totalPageChunks = 0;
      pages.forEach((page) => {
        const cleaned = (page.text ?? "").replace(/\s+/g, " ").trim();
        if (cleaned.length < 100) return;
        const newChunks = chunkText(cleaned, file, page.num);
        allChunks.push(...newChunks);
        totalPageChunks += newChunks.length;
      });
      await parser.destroy();
      console.log(`    → ${pages.length} pages, ${totalPageChunks} chunks`);
    } catch (e) {
      console.error(`    Error parsing ${file}:`, e instanceof Error ? e.message : e);
    }
  }

  fs.writeFileSync(INDEX_FILE, JSON.stringify(allChunks, null, 2));
  const sizeMb = (fs.statSync(INDEX_FILE).size / 1024 / 1024).toFixed(2);
  console.log(`\n✓ Indexed ${allChunks.length} chunks → ${INDEX_FILE} (${sizeMb} MB)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
