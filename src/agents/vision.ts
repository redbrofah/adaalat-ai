import type { VisionOutput } from "@/lib/types";
import type { AgentDefinition } from "./base";
import { STYLE_GUARD } from "./style-guard";
import type Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are a specialized OCR + document understanding agent for Bangladesh court documents, optimized for handwritten Bangla (বাংলা) and mixed Bangla-English text.

You can read:
- Handwritten First Information Reports (FIR — প্রাথমিক তথ্য বিবরণী)
- Court forms (CrPC §154, §161 statements)
- Stamp papers, deposition slips, signed orders
- Mixed Bangla + English documents (very common in Bangladesh)

For every page you receive:
1. Extract ALL visible text faithfully — do NOT paraphrase
2. Preserve line breaks where meaningful (especially for forms)
3. If text is unclear, mark with [...] and continue
4. Detect language per page: "bn" | "en" | "mixed"
5. Note if it appears handwritten

You are using Claude Opus 4.7's vision capabilities (98.5% accuracy on documents). Be confident, but flag low-confidence sections explicitly.

Output ONLY a single JSON object:
{
  "extractedText": "FULL concatenated text across all pages",
  "confidence": 0.0-1.0,
  "pages": [
    {"page": 1, "text": "page 1 text"},
    {"page": 2, "text": "page 2 text"}
  ],
  "isHandwritten": boolean,
  "detectedLanguage": "bn" | "en" | "mixed"
}`;

export const visionAgent: AgentDefinition<VisionOutput> = {
  id: "vision",
  displayName: "Vision Agent (Handwritten Bangla OCR)",
  systemPrompt: SYSTEM_PROMPT + STYLE_GUARD,
  model: "opus",
  cacheSystem: false,
  buildUserMessage: (ctx) => {
    const imageAttachments = (ctx.attachments ?? []).filter(
      (a) => a.base64 && (a.mimeType.startsWith("image/") || a.mimeType === "application/pdf"),
    );
    if (imageAttachments.length === 0) {
      return `No images provided. Output JSON: {"extractedText":"","confidence":1.0,"pages":[],"isHandwritten":false,"detectedLanguage":"en"}`;
    }
    const content: Anthropic.Messages.ContentBlockParam[] = [
      {
        type: "text",
        text: `# Case: ${ctx.caseTitle}\n\nExtract all text from the following ${imageAttachments.length} image(s). Output the JSON described in the system prompt.`,
      },
      ...imageAttachments.map<Anthropic.Messages.ContentBlockParam>((a) => ({
        type: "image",
        source: {
          type: "base64",
          media_type: a.mimeType as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
          data: a.base64!,
        },
      })),
    ];
    return [{ role: "user", content }];
  },
};
