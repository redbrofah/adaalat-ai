import type { AgentEvent } from "@/lib/types";

type Listener = (event: AgentEvent) => void;

const channels = new Map<string, Set<Listener>>();
const history = new Map<string, AgentEvent[]>();

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
