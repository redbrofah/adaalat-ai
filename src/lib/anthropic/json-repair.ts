/**
 * Best-effort JSON parser that tolerates truncated model output.
 * - If standard JSON.parse works, return it.
 * - Otherwise, try to close unterminated strings/objects/arrays at the right depth.
 */
export function repairAndParseJson<T>(raw: string): T {
  // Strip code fences and surrounding prose
  const fenceMatch = raw.match(/```json\s*([\s\S]+?)\s*```/);
  let candidate = fenceMatch ? fenceMatch[1] : raw;
  candidate = extractFirstJsonRegion(candidate);

  try {
    return JSON.parse(candidate) as T;
  } catch {
    // continue
  }

  const repaired = repairJson(candidate);
  try {
    return JSON.parse(repaired) as T;
  } catch {
    throw new Error(
      `Failed to parse JSON even after repair. Original head:\n${raw.slice(0, 800)}\n…\nrepaired head:\n${repaired.slice(0, 400)}`,
    );
  }
}

function extractFirstJsonRegion(s: string): string {
  const firstBrace = s.indexOf("{");
  const firstBracket = s.indexOf("[");
  const start =
    firstBrace === -1 ? firstBracket : firstBracket === -1 ? firstBrace : Math.min(firstBrace, firstBracket);
  if (start === -1) return s;
  return s.slice(start);
}

function repairJson(input: string): string {
  let inString = false;
  let escape = false;
  const stack: ("{" | "[")[] = [];
  const trimEndAt = input.length;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\") {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === "{") stack.push("{");
    else if (ch === "[") stack.push("[");
    else if (ch === "}" || ch === "]") stack.pop();
  }

  let repaired = input.slice(0, trimEndAt);
  if (inString) {
    // Close the unterminated string
    repaired = repaired.replace(/,?\s*$/, "");
    repaired += '"';
  }
  // Remove trailing partial value like `: ` or `: "...` cleanup
  repaired = repaired.replace(/,\s*$/, "");
  repaired = repaired.replace(/:\s*$/, ": null");
  // Close stacked containers in reverse
  while (stack.length > 0) {
    const open = stack.pop()!;
    repaired += open === "{" ? "}" : "]";
  }
  return repaired;
}
