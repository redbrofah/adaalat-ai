"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Scale, FileText, Sparkles, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentCard, blankCard, applyEventToCard, type AgentCardData } from "@/components/AgentCard";
import { LanguageToggle } from "@/components/LanguageToggle";
import { UserMenu } from "@/components/UserMenu";
import { useLang } from "@/lib/i18n/context";
import { strings, t } from "@/lib/i18n/strings";
import { resolveMessage } from "@/lib/i18n/resolve";
import type { AgentEvent, AgentEventMessageRef, AgentId } from "@/lib/types";

const AGENT_ORDER: AgentId[] = [
  "vision",
  "classification",
  "conflict",
  "precedent",
  "deadline",
  "reasoning",
  "translation",
  "synthesis",
  "critic",
];

interface OrchestratorEntry {
  message?: string;
  messageRef?: AgentEventMessageRef;
  ts: number;
  status?: string;
}

const STALE_AGE_MS = 600_000; // 10 minutes — longer than any case run

export default function CaseDashboardPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const caseId = params.id;
  const { lang } = useLang();

  const [cards, setCards] = useState<Record<AgentId, AgentCardData>>(() => {
    const c: Record<string, AgentCardData> = {};
    for (const a of AGENT_ORDER) c[a] = blankCard();
    return c as Record<AgentId, AgentCardData>;
  });
  const [orchestratorLog, setOrchestratorLog] = useState<OrchestratorEntry[]>([]);
  const [done, setDone] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  // Auto-redirect if user lands on this page for a case that is already finished
  // or stale (no point showing empty/idle cards as a dead-end).
  useEffect(() => {
    if (!caseId) return;
    let cancelled = false;
    fetch(`/api/case/${caseId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled || !d?.case) return;
        const ageMs = Date.now() - (d.case.uploadedAt ?? 0);
        if (d.status === "complete") {
          router.replace(`/case/${caseId}/brief`);
        } else if (d.status !== "complete" && ageMs > STALE_AGE_MS) {
          router.replace(`/case/${caseId}/inspect`);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [caseId, router]);

  useEffect(() => {
    if (!caseId) return;
    const es = new EventSource(`/api/case/${caseId}/events`);
    es.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.type !== "event") return;
      const evt: AgentEvent = data.payload;
      if (evt.startedAt && !startedAt) setStartedAt(evt.startedAt);

      if (evt.agent === "orchestrator") {
        if (evt.messageRef || evt.message) {
          setOrchestratorLog((l) => [
            ...l,
            { messageRef: evt.messageRef, message: evt.message, ts: Date.now(), status: evt.status },
          ]);
        }
        if (evt.status === "done") {
          setDone(true);
          if (evt.costUsd) setTotalCost(evt.costUsd);
        }
        return;
      }

      setCards((prev) => ({
        ...prev,
        [evt.agent]: applyEventToCard(prev[evt.agent] ?? blankCard(), evt),
      }));
      if (evt.costUsd) setTotalCost((c) => c + evt.costUsd!);
    };
    es.onerror = () => {
      es.close();
    };
    return () => es.close();
  }, [caseId, startedAt]);

  const elapsed = useMemo(() => {
    if (!startedAt) return 0;
    return ((Date.now() - startedAt) / 1000) | 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAt, cards, done]);

  const fontClass = lang === "bn" ? "font-bangla" : "";

  return (
    <main className={`min-h-screen ${fontClass}`}>
      <header className="border-b border-emerald-500/10 backdrop-blur-sm sticky top-0 z-20 bg-[#0a1628]/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <Scale className="w-6 h-6 text-emerald-400" strokeWidth={1.5} />
              <div className="font-serif text-xl">AdaalatAI</div>
            </Link>
            <Link href="/" className="text-sm text-stone-400 hover:text-emerald-300 inline-flex items-center gap-1 ml-2">
              <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">{t(strings.nav2.backHome, lang)}</span>
            </Link>
          </div>
          <div className="flex items-center gap-4 text-sm flex-wrap justify-end">
            <div className="hidden md:block">
              <span className="text-stone-500">{t(strings.dashboard.case, lang)}:</span>{" "}
              <span className="font-mono text-stone-300">{caseId.slice(0, 8)}</span>
            </div>
            <div>
              <span className="text-stone-500">{t(strings.dashboard.elapsed, lang)}:</span>{" "}
              <span className="font-mono text-emerald-300">{elapsed}s</span>
            </div>
            <div>
              <span className="text-stone-500">{t(strings.dashboard.cost, lang)}:</span>{" "}
              <span className="font-mono text-emerald-300">${totalCost.toFixed(3)}</span>
            </div>
            <UserMenu />
            <LanguageToggle />
            {done && (
              <Link href={`/case/${caseId}/brief`}>
                <Button className="bg-emerald-500 hover:bg-emerald-400 text-[#0a1628] font-semibold">
                  {t(strings.dashboard.viewBrief, lang)} <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl mb-1">{t(strings.dashboard.title, lang)}</h1>
          <p className="text-stone-400 text-sm">{t(strings.dashboard.sub, lang)}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {AGENT_ORDER.map((id) => (
            <AgentCard key={id} id={id} data={cards[id]} />
          ))}
        </div>

        <div className="rounded-xl border border-emerald-500/15 bg-[#0e1e38]/60 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <div className="font-medium">{t(strings.dashboard.orchestratorLog, lang)}</div>
          </div>
          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-2">
            {orchestratorLog.length === 0 && (
              <div className="text-sm text-stone-500">{t(strings.dashboard.starting, lang)}</div>
            )}
            {orchestratorLog.map((l, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm text-stone-300 flex gap-2"
              >
                <span className="text-stone-500 font-mono text-xs shrink-0">
                  {new Date(l.ts).toLocaleTimeString("en-GB").slice(3)}
                </span>
                <span className={lang === "bn" ? "font-bangla" : ""}>
                  {resolveMessage(l.messageRef, l.message, lang)}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {done && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 flex items-center justify-between gap-4 flex-wrap"
          >
            <div>
              <div className="font-serif text-2xl text-emerald-300 mb-1">{t(strings.dashboard.briefReady, lang)}</div>
              <div className="text-sm text-stone-300">
                {t(strings.dashboard.summaryLine, lang)
                  .replace("{secs}", String(elapsed))
                  .replace("{cost}", totalCost.toFixed(3))}
              </div>
            </div>
            <Link href={`/case/${caseId}/brief`}>
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-[#0a1628] font-semibold">
                <FileText className="w-5 h-5 mr-2" />
                {t(strings.dashboard.viewBilingual, lang)}
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </main>
  );
}
