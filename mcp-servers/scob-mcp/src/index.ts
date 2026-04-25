/**
 * scob-mcp — A Model Context Protocol server exposing search over
 * 2,048 pages of the Supreme Court Online Bulletin (SCOB Issues 15-20, 2021-2025).
 *
 * Tools:
 *   - search_scob(query, case_type?, limit?)
 *   - get_judgment_full_text(citation)
 *   - status()
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import {
  searchScobPrecedents,
  getJudgmentFullText,
  getScobStatus,
} from "../../../src/lib/mcp/scob";

const server = new Server(
  { name: "scob-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "search_scob",
      description:
        "Search 2,048 pages of Supreme Court Online Bulletin (SCOB Issues 15-20, 2021-2025) for relevant precedents. Returns citation, source PDF, page, and a snippet.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Legal principle or fact pattern" },
          case_type: { type: "string", description: "Optional: criminal/civil/family/etc" },
          limit: { type: "number", description: "Max results, default 5" },
        },
        required: ["query"],
      },
    },
    {
      name: "get_judgment_full_text",
      description: "Fetch all chunks containing a specific citation or distinctive phrase.",
      inputSchema: {
        type: "object",
        properties: {
          citation: { type: "string", description: "Citation or distinctive phrase" },
        },
        required: ["citation"],
      },
    },
    {
      name: "status",
      description: "Report indexing status: chunk count, PDF count.",
      inputSchema: { type: "object", properties: {} },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const args = (req.params.arguments ?? {}) as Record<string, unknown>;
  switch (req.params.name) {
    case "search_scob": {
      const result = searchScobPrecedents(args.query as string, {
        caseType: args.case_type as string | undefined,
        limit: (args.limit as number) ?? 5,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
    case "get_judgment_full_text": {
      const result = getJudgmentFullText(args.citation as string);
      return { content: [{ type: "text", text: JSON.stringify(result ?? { notFound: true }, null, 2) }] };
    }
    case "status": {
      const result = getScobStatus();
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
    default:
      throw new Error(`Unknown tool: ${req.params.name}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  const status = getScobStatus();
  console.error(
    `[scob-mcp] Ready. ${status.chunkCount} chunks indexed from ${status.pdfCount} PDFs.`,
  );
}

main().catch((err) => {
  console.error("[scob-mcp] Fatal:", err);
  process.exit(1);
});
