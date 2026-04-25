/**
 * Belt-and-suspenders defense against AI-marker punctuation.
 * Strips em-dashes (—) and en-dashes (–) used as sentence punctuation,
 * replacing them with safer alternatives.
 */
export function sanitizeText(input: string): string {
  if (typeof input !== "string") return input;
  return input
    .replace(/\s+—\s+/g, ", ")
    .replace(/\s+–\s+/g, ", ")
    .replace(/—/g, ",")
    .replace(/–/g, ",");
}

export function sanitizeDeep<T>(value: T): T {
  if (typeof value === "string") return sanitizeText(value) as unknown as T;
  if (Array.isArray(value)) return value.map((v) => sanitizeDeep(v)) as unknown as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = sanitizeDeep(v);
    }
    return out as T;
  }
  return value;
}
