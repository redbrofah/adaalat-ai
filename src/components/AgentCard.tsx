"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, AlertCircle, Circle, Wrench, FileText, Sparkles, GitBranch, Scale, Clock, Languages, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentEvent, AgentId, AgentStatus } from "@/lib/types";
import { useLang } from "@/lib/i18n/context";
import { strings, t } from "@/lib/i18n/strings";
import { resolveMessage } from "@/lib/i18n/resolve";

const ICONS: Record<AgentId, React.ReactNode> = {
  orchestrator: <Sparkles className="w-5 h-5" />,
  vision: <FileText className="w-5 h-5" />,
  classification: <Sparkles className="w-5 h-5" />,
  conflict: <GitBranch className="w-5 h-5" />,
  precedent: <Scale className="w-5 h-5" />,
  deadline: <Clock className="w-5 h-5" />,
  reasoning: <Sparkles className="w-5 h-5" />,
  translation: <Languages className="w-5 h-5" />,
  synthesis: <FileText className="w-5 h-5" />,
  critic: <Shield className="w-5 h-5" />,
};

const COLORS: Record<AgentId, string> = {
  orchestrator: "from-emerald-400 to-teal-500",
  vision: "from-violet-400 to-purple-500",
  classification: "from-cyan-400 to-blue-500",
  conflict: "from-rose-400 to-pink-500",
  precedent: "from-emerald-300 to-green-500",
  deadline: "from-orange-400 to-red-500",
  reasoning: "from-emerald-400 to-teal-500",
  translation: "from-pink-400 to-fuchsia-500",
  synthesis: "from-emerald-400 to-teal-500",
  critic: "from-red-300 to-pink-500",
};

export interface AgentCardData {
  status: AgentStatus;
  startedAt?: number;
  completedAt?: number;
  message?: string;
  messageRef?: AgentEvent["messageRef"];
  toolCalls: { name: string; args: Record<string, unknown> }[];
  finalOutput?: unknown;
  error?: string;
  costUsd?: number;
  tokensIn?: number;
  tokensOut?: number;
}

function nameFor(id: AgentId, lang: "en" | "bn"): string {
  if (id === "orchestrator") return t(strings.agentsAlsoLabels.orchestrator, lang);
  return t(strings.agents[id as Exclude<AgentId, "orchestrator">].name, lang);
}

function subtitleFor(id: AgentId, lang: "en" | "bn"): string {
  const map: Record<AgentId, { en: string; bn: string }> = {
    orchestrator: strings.agentCard.masterCoordinator,
    vision: strings.agentsAlsoLabels.visionSubtitle,
    classification: strings.agentsAlsoLabels.classificationSubtitle,
    conflict: strings.agentsAlsoLabels.conflictSubtitle,
    precedent: strings.agentsAlsoLabels.precedentSubtitle,
    deadline: strings.agentsAlsoLabels.deadlineSubtitle,
    reasoning: strings.agentsAlsoLabels.reasoningSubtitle,
    translation: strings.agentsAlsoLabels.translationSubtitle,
    synthesis: strings.agentsAlsoLabels.synthesisSubtitle,
    critic: strings.agentsAlsoLabels.criticSubtitle,
  };
  return t(map[id], lang);
}

export function AgentCard({ id, data }: { id: AgentId; data: AgentCardData }) {
  const { lang } = useLang();
  const elapsed = data.startedAt
    ? ((data.completedAt ?? Date.now()) - data.startedAt) / 1000
    : 0;

  const idleLabel = t(strings.agentCard.idle, lang);
  const liveMessage = resolveMessage(data.messageRef, data.message, lang);

  return (
    <motion.div
      layout
      className={cn(
        "relative rounded-xl border overflow-hidden",
        "bg-gradient-to-br from-[#0e1e38]/80 to-[#0a1628]/80",
        data.status === "running" && "border-emerald-400/50 shadow-[0_0_30px_-10px_rgba(16,185,129,0.4)]",
        data.status === "done" && "border-emerald-500/40",
        data.status === "error" && "border-red-500/50",
        data.status === "idle" && "border-emerald-500/10",
      )}
    >
      {data.status === "running" && (
        <motion.div
          className={cn("absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r", COLORS[id])}
          animate={{ x: ["0%", "100%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      )}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-lg bg-gradient-to-br grid place-items-center text-[#0a1628]", COLORS[id])}>
              {ICONS[id]}
            </div>
            <div>
              <div className="font-medium text-stone-100">{nameFor(id, lang)}</div>
              <div className="text-[11px] text-stone-400">{subtitleFor(id, lang)}</div>
            </div>
          </div>
          <StatusBadge status={data.status} />
        </div>

        <div className="text-xs text-stone-400 mb-2 min-h-[1rem]">
          {liveMessage || (data.status === "idle" ? idleLabel : "")}
        </div>

        <AnimatePresence>
          {data.toolCalls.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1 mt-2"
            >
              {data.toolCalls.slice(-3).map((tc, i) => (
                <div key={i} className="text-[11px] font-mono text-emerald-300/80 truncate">
                  <Wrench className="w-3 h-3 inline mr-1" />
                  {tc.name}({JSON.stringify(tc.args).slice(0, 60)})
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-3 flex items-center justify-between text-[11px] text-stone-500">
          <span>
            {(data.status === "running" || data.status === "done") && (
              <>⏱ {elapsed.toFixed(1)}s</>
            )}
          </span>
          <span>
            {data.costUsd !== undefined && data.costUsd > 0 && (
              <>${data.costUsd.toFixed(3)}</>
            )}
          </span>
        </div>

        {data.error && (
          <div className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 p-2 text-[11px] text-red-300">
            {data.error}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: AgentStatus }) {
  const { lang } = useLang();
  const style = {
    idle: "bg-stone-700/50 text-stone-400",
    queued: "bg-stone-700/50 text-stone-300",
    running: "bg-emerald-500/20 text-emerald-200",
    done: "bg-emerald-500/20 text-emerald-300",
    error: "bg-red-500/20 text-red-300",
  }[status];
  const icon = {
    idle: <Circle className="w-3 h-3" />,
    queued: <Circle className="w-3 h-3" />,
    running: <Loader2 className="w-3 h-3 animate-spin" />,
    done: <CheckCircle2 className="w-3 h-3" />,
    error: <AlertCircle className="w-3 h-3" />,
  }[status];
  const label = t(strings.status[status], lang);
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider", style)}>
      {icon} {label}
    </span>
  );
}

export function applyEventToCard(card: AgentCardData, event: AgentEvent): AgentCardData {
  const next = { ...card };
  if (event.status) next.status = event.status;
  if (event.messageRef) {
    next.messageRef = event.messageRef;
    next.message = undefined;
  } else if (event.message) {
    next.message = event.message;
    next.messageRef = undefined;
  }
  if (event.startedAt) next.startedAt = event.startedAt;
  if (event.completedAt) next.completedAt = event.completedAt;
  if (event.error) next.error = event.error;
  if (event.finalOutput !== undefined) next.finalOutput = event.finalOutput;
  if (event.costUsd !== undefined) next.costUsd = (next.costUsd ?? 0) + event.costUsd;
  if (event.tokensIn !== undefined) next.tokensIn = (next.tokensIn ?? 0) + event.tokensIn;
  if (event.tokensOut !== undefined) next.tokensOut = (next.tokensOut ?? 0) + event.tokensOut;
  if (event.toolCall) next.toolCalls = [...next.toolCalls, event.toolCall];
  return next;
}

export function blankCard(): AgentCardData {
  return {
    status: "idle",
    toolCalls: [],
  };
}
