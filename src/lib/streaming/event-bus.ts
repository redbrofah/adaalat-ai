import type { AgentEvent } from "@/lib/types";

type Listener = (event: AgentEvent) => void;

// Use globalThis so the in-memory state survives Next.js hot-module-reload.
// Without this, every file save during a case run clears all SSE history.
declare global {
  // eslint-disable-next-line no-var
  var __adaalat_channels: Map<string, Set<Listener>> | undefined;
  // eslint-disable-next-line no-var
  var __adaalat_history: Map<string, AgentEvent[]> | undefined;
}

const channels: Map<string, Set<Listener>> =
  globalThis.__adaalat_channels ?? new Map();
const history: Map<string, AgentEvent[]> =
  globalThis.__adaalat_history ?? new Map();

if (!globalThis.__adaalat_channels) globalThis.__adaalat_channels = channels;
if (!globalThis.__adaalat_history) globalThis.__adaalat_history = history;

export function publish(event: AgentEvent) {
  const listeners = channels.get(event.caseId);
  const hist = history.get(event.caseId) ?? [];
  hist.push(event);
  history.set(event.caseId, hist);
  if (!listeners) return;
  for (const l of listeners) {
    try {
      l(event);
    } catch (e) {
      console.error("[event-bus] listener error", e);
    }
  }
}

export function subscribe(caseId: string, listener: Listener): () => void {
  let set = channels.get(caseId);
  if (!set) {
    set = new Set();
    channels.set(caseId, set);
  }
  set.add(listener);
  return () => {
    set!.delete(listener);
    if (set!.size === 0) channels.delete(caseId);
  };
}

export function getHistory(caseId: string): AgentEvent[] {
  return history.get(caseId) ?? [];
}

export function clearHistory(caseId: string): void {
  history.delete(caseId);
}
