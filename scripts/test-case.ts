/**
 * Smoke test: run orchestrator directly on a sample case file
 * Usage: npm run test:case -- family_case_case_file
 */
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import { runOrchestrator } from "../src/agents/orchestrator";
import { subscribe } from "../src/lib/streaming/event-bus";

const slug = process.argv[2] ?? "family_case_case_file";
const file = path.join("./data/cases", `${slug}.md`);

if (!fs.existsSync(file)) {
  console.error(`Case file not found: ${file}`);
  process.exit(1);
}

const text = fs.readFileSync(file, "utf-8");
const title = `Test: ${slug.replace(/_/g, " ")}`;
const caseId = `test-${Date.now()}`;

console.log(`\n🏛️  AdaalatAI smoke test — ${title}`);
console.log(`   Case ID: ${caseId}`);
console.log(`   Case length: ${text.length} chars`);
console.log("─".repeat(70));

subscribe(caseId, (evt) => {
  const tag = evt.agent.padEnd(15);
  const status = evt.status.padEnd(8);
  const elapsed = evt.startedAt && evt.completedAt
    ? ` (${((evt.completedAt - evt.startedAt) / 1000).toFixed(1)}s)`
    : "";
  const cost = evt.costUsd ? ` $${evt.costUsd.toFixed(3)}` : "";
  const tool = evt.toolCall ? ` 🔧 ${evt.toolCall.name}` : "";
  const msg = evt.message ? ` — ${evt.message.slice(0, 80)}` : "";
  console.log(`[${tag}] ${status}${elapsed}${cost}${tool}${msg}`);
});

runOrchestrator({
  caseId,
  caseTitle: title,
  caseText: text,
  enableVision: false,
  enableCritic: true,
})
  .then((result) => {
    console.log("\n" + "═".repeat(70));
    console.log(`✅ Done in ${result.totalSeconds.toFixed(1)}s`);
    console.log(`   Total cost: $${result.budget.totalCostUsd.toFixed(4)}`);
    console.log(`   Tokens: ${result.budget.totalTokensIn} in / ${result.budget.totalTokensOut} out`);
    console.log(`   Per agent:`);
    for (const [agent, cost] of Object.entries(result.budget.perAgentCostUsd)) {
      console.log(`     ${agent.padEnd(15)} $${cost.toFixed(4)}`);
    }
    console.log("\n📜 Brief preview (Bangla):");
    console.log(result.synthesis.briefBangla.slice(0, 600));
    console.log("\n📜 Draft order preview (English):");
    console.log(result.synthesis.draftOrderEnglish.slice(0, 400));
    process.exit(0);
  })
  .catch((e) => {
    console.error("\n❌ Failed:", e);
    process.exit(1);
  });
