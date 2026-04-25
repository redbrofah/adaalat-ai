/**
 * bdlaws-mcp — A Model Context Protocol server exposing search over
 * 1,484 Bangladesh Acts (1799–2025).
 *
 * Tools:
 *   - search_bdlaws(query, year_min?, year_max?, limit?)
 *   - get_act_section(actName, sectionQuery)
 *   - list_all_acts()
 *
 * Usage:
 *   tsx mcp-servers/bdlaws-mcp/src/index.ts
 *   (or compile and run as stdio MCP server in Claude Desktop)
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

import { searchBdlaws, getActSection, listAllActs } from "../../../src/lib/mcp/bdlaws";

const server = new Server(
  { name: "bdlaws-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "search_bdlaws",
      description:
        "Keyword search across 1,484 Bangladesh Acts (1799–2025). Returns title, year, matching section snippet, and relevance score.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Legal terms to search (English)" },
          year_min: { type: "number", description: "Optional minimum year" },
          year_max: { type: "number", description: "Optional maximum year" },
          limit: { type: "number", description: "Max results, default 10" },
          include_repealed: { type: "boolean", description: "Include repealed acts (default false)" },
        },
        required: ["query"],
      },
    },
    {
      name: "get_act_section",
      description: "Fetch sections of a specific act by partial name match plus a section query.",
      inputSchema: {
        type: "object",
        properties: {
          actName: { type: "string", description: "Act title or partial match" },
          sectionQuery: { type: "string", description: "Section number or topic to highlight" },
        },
        required: ["actName", "sectionQuery"],
      },
    },
    {
      name: "list_all_acts",
      description: "List all 1,484 acts with year and repealed status.",
      inputSchema: { type: "object", properties: {} },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const args = (req.params.arguments ?? {}) as Record<string, unknown>;
  switch (req.params.name) {
    case "search_bdlaws": {
      const yearMin = args.year_min as number | undefined;
      const yearMax = args.year_max as number | undefined;
      const yearRange =
        yearMin !== undefined && yearMax !== undefined ? ([yearMin, yearMax] as [number, number]) : undefined;
      const result = searchBdlaws(args.query as string, {
        yearRange,
        limit: (args.limit as number) ?? 10,
        includeRepealed: (args.include_repealed as boolean) ?? false,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
    case "get_act_section": {
      const result = getActSection(args.actName as string, args.sectionQuery as string);
      return { content: [{ type: "text", text: JSON.stringify(result ?? { notFound: true }, null, 2) }] };
    }
    case "list_all_acts": {
      const result = listAllActs();
      return { content: [{ type: "text", text: JSON.stringify({ count: result.length, acts: result }, null, 2) }] };
    }
    default:
      throw new Error(`Unknown tool: ${req.params.name}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[bdlaws-mcp] Ready. 1,484 acts loaded.");
}

main().catch((err) => {
  console.error("[bdlaws-mcp] Fatal:", err);
  process.exit(1);
});
