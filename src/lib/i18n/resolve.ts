import { strings, type Lang } from "./strings";
import type { AgentEventMessageRef } from "@/lib/types";

type Pair = { en: string; bn: string };

function isPair(value: unknown): value is Pair {
  return (
    !!value &&
    typeof value === "object" &&
    "en" in (value as Record<string, unknown>) &&
    "bn" in (value as Record<string, unknown>)
  );
}

function lookup(key: string): unknown {
  const segments = key.split(".");
  let node: unknown = strings;
  for (const seg of segments) {
    if (!node || typeof node !== "object") return null;
    node = (node as Record<string, unknown>)[seg];
  }
  return node;
}

function fillTemplate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) => {
    const v = params[name];
    return v === undefined ? `{${name}}` : String(v);
  });
}

export function resolveRef(ref: AgentEventMessageRef, lang: Lang, fallback?: string): string {
  const node = lookup(ref.key);
  if (!node) return fallback ?? ref.key;

  if (isPair(node)) {
    return fillTemplate((node as Pair)[lang], ref.params);
  }

  if (Array.isArray(node) && ref.params && typeof ref.params.idx === "number") {
    const arr = node as Pair[];
    if (arr.length === 0) return fallback ?? ref.key;
    const item = arr[Math.abs(ref.params.idx) % arr.length];
    if (isPair(item)) return fillTemplate(item[lang], ref.params);
  }

  return fallback ?? ref.key;
}

export function resolveMessage(
  ref: AgentEventMessageRef | undefined,
  rawMessage: string | undefined,
  lang: Lang,
): string {
  if (ref) return resolveRef(ref, lang, rawMessage);
  return rawMessage ?? "";
}
