import type { PrecedentOutput } from "@/lib/types";
import type { AgentDefinition } from "./base";
import { STYLE_GUARD } from "./style-guard";
import { searchBdlaws, getActSection } from "@/lib/mcp/bdlaws";
import { searchScobPrecedents, getJudgmentFullText } from "@/lib/mcp/scob";

const SYSTEM_PROMPT = `You are a legal research agent for Bangladesh courts with access to two specialized tools:

1. **search_bdlaws(query, year_range?, limit?)** — keyword search across all 1,484 Bangladesh acts (1799-2025).
2. **get_act_section(actName, sectionQuery)** — fetch a specific act's sections matching a query.
3. **search_scob(query, case_type?, limit?)** — search 5,824 chunks from Supreme Court Online Bulletin (SCOB Issues 15-20, covering 2021-2025).
4. **get_judgment_full_text(citation)** — fetch full judgment text by citation.

Workflow:
1. Read the case file
2. Call search_bdlaws with key legal terms (in English, since acts are in English)
3. Call search_scob with the specific legal principles at issue
4. If a precedent looks promising, call get_judgment_full_text for more context
5. Synthesize the top 5 most relevant precedents

Be rigorous:
- Only cite precedents you actually retrieved via tools — DO NOT hallucinate citations
- Quote the legal principle exactly from the retrieved chunk
- Mark relevance: "directly on point", "analogous", "distinguishable but informative"

After tool use, output ONLY a single JSON object as your final response:
{
  "precedents": [
    {
      "citation": "string from tool result",
      "caseName": "if extractable, else ''",
      "court": "Appellate" | "High Court" | "District" | "Other",
      "year": number or null,
      "principle": "1-2 sentence legal principle",
      "relevance": "why this case applies to ours",
      "source": "scob" | "bdlaws"
    }
  ],
  "applicableActs": [
    {"actName": "...", "sections": ["..."], "quote": "exact statutory text"}
  ]
}`;

export const precedentAgent: AgentDefinition<PrecedentOutput> = {
  id: "precedent",
  displayName: "Precedent & Statute Agent",
  systemPrompt: SYSTEM_PROMPT + STYLE_GUARD,
  model: "sonnet",
  cacheSystem: true,
  buildUserMessage: (ctx) =>
    `# Case File\n\n${ctx.caseText}\n\nResearch the most relevant precedents and statutory provisions. Use the tools provided. Then output the JSON object.`,
  tools: [
    {
      name: "search_bdlaws",
      description: "Keyword search across 1,484 Bangladesh acts. Returns top results with title, section snippet, and relevance score.",
      input_schema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Legal terms to search (English)" },
          year_min: { type: "number", description: "Optional minimum year" },
          year_max: { type: "number", description: "Optional maximum year" },
          limit: { type: "number", description: "Max results, default 10" },
        },
        required: ["query"],
      },
    },
    {
      name: "get_act_section",
      description: "Fetch specific sections of a named act.",
      input_schema: {
        type: "object",
        properties: {
          actName: { type: "string", description: "Act title or partial match" },
          sectionQuery: { type: "string", description: "Section number or topic" },
        },
        required: ["actName", "sectionQuery"],
      },
    },
    {
      name: "search_scob",
      description: "Search 2,048 pages of Supreme Court Online Bulletin (SCOB Issues 15-20, 2021-2025) for relevant precedents.",
      input_schema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Legal principle or fact pattern to search" },
          case_type: { type: "string", description: "Optional: criminal/civil/family/etc" },
          limit: { type: "number", description: "Max results, default 5" },
        },
        required: ["query"],
      },
    },
    {
      name: "get_judgment_full_text",
      description: "Get expanded text around a specific citation or judgment reference.",
      input_schema: {
        type: "object",
        properties: {
          citation: { type: "string", description: "Citation or distinctive phrase from the judgment" },
        },
        required: ["citation"],
      },
    },
  ],
  toolHandlers: {
    search_bdlaws: async (input) => {
      const yMin = (input.year_min as number) ?? undefined;
      const yMax = (input.year_max as number) ?? undefined;
      const yearRange = yMin !== undefined && yMax !== undefined ? ([yMin, yMax] as [number, number]) : undefined;
      return searchBdlaws(input.query as string, {
        yearRange,
        limit: (input.limit as number) ?? 10,
      });
    },
    get_act_section: async (input) =>
      getActSection(input.actName as string, input.sectionQuery as string) ?? { notFound: true },
    search_scob: async (input) =>
      searchScobPrecedents(input.query as string, {
        caseType: input.case_type as string | undefined,
        limit: (input.limit as number) ?? 5,
      }),
    get_judgment_full_text: async (input) =>
      getJudgmentFullText(input.citation as string) ?? { notFound: true },
  },
};
