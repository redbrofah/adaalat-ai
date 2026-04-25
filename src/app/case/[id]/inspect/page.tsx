"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Scale, ArrowLeft, RefreshCw, Trash2, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LanguageToggle } from "@/components/LanguageToggle";
import { UserMenu } from "@/components/UserMenu";
import { useLang } from "@/lib/i18n/context";
import { strings, t } from "@/lib/i18n/strings";
import type { AgentId, CaseFile, CaseStatus } from "@/lib/types";

interface InspectData {
  case: CaseFile;
  status: CaseStatus;
  availableAgents: AgentId[];
}

export default function InspectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { lang } = useLang();
  const [data, setData] = useState<InspectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    fetch(`/api/case/${id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [id]);

  const reprocess = async () => {
    setActing(true);
    const r = await fetch(`/api/case/${id}/reprocess`, { method: "POST" });
    if (r.ok) {
      router.push(`/case/${id}`);
    } else {
      setActing(false);
    }
  };

  const remove = async () => {
    if (!confirm(t(strings.admin.confirmDelete, lang))) return;
    setActing(true);
    const r = await fetch(`/api/case/${id}`, { method: "DELETE" });
    if (r.ok) {
      router.push("/admin");
    } else {
      setActing(false);
    }
  };

  const fontClass = lang === "bn" ? "font-bangla" : "";

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!data?.case) {
    return (
      <div className="min-h-screen grid place-items-center text-stone-300">
        <div className="text-center">
          <p className="mb-4">Case not found.</p>
          <Link href="/admin"><Button>{t(strings.inspect.backToAll, lang)}</Button></Link>
        </div>
      </div>
    );
  }

  const ALL_AGENTS: AgentId[] = [
    "vision", "classification", "conflict", "precedent",
    "deadline", "reasoning", "translation", "synthesis", "critic",
  ];

  return (
    <main className={`min-h-screen ${fontClass}`}>
      <header className="border-b border-emerald-500/10 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <Scale className="w-6 h-6 text-emerald-400" strokeWidth={1.5} />
            <div className="font-serif text-xl">AdaalatAI</div>
          </Link>
          <div className="flex items-center gap-3">
            <UserMenu />
            <LanguageToggle />
            <Link href="/" className="text-sm text-stone-400 hover:text-emerald-300 inline-flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> {t(strings.nav2.backHome, lang)}
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="font-serif text-4xl mb-2">{t(strings.inspect.title, lang)}</h1>
        <p className="text-stone-400 mb-8">{t(strings.inspect.sub, lang)}</p>

        <div className="rounded-xl border border-emerald-500/15 bg-[#0e1e38]/60 p-6 mb-6">
          <div className={`${lang === "bn" ? "font-bangla" : "font-serif"} text-2xl mb-2`}>{data.case.title}</div>
          <div className="text-xs text-stone-500 flex items-center gap-3 flex-wrap">
            <span className="font-mono">{data.case.id}</span>
            <span>{new Date(data.case.uploadedAt).toLocaleString("en-GB")}</span>
            <StatusPill status={data.status} lang={lang} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="rounded-xl border border-emerald-500/15 bg-[#0e1e38]/40 p-5">
            <div className="text-xs uppercase tracking-wider text-stone-400 mb-3">{t(strings.inspect.agentsLabel, lang)}</div>
            <div className="space-y-1.5">
              {ALL_AGENTS.map((a) => {
                const present = data.availableAgents.includes(a);
                return (
                  <div key={a} className="flex items-center gap-2 text-sm">
                    {present ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-stone-600" />
                    )}
                    <span className={present ? "text-stone-200" : "text-stone-600"}>{a}</span>
                  </div>
                );
              })}
              {data.availableAgents.length === 0 && (
                <div className="text-sm text-stone-500">{t(strings.inspect.noOutputs, lang)}</div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-emerald-500/15 bg-[#0e1e38]/40 p-5">
            <div className="text-xs uppercase tracking-wider text-stone-400 mb-3">{t(strings.inspect.rawCaseLabel, lang)}</div>
            <pre className={`${lang === "bn" ? "font-bangla" : "font-mono"} text-xs text-stone-300 whitespace-pre-wrap max-h-72 overflow-y-auto`}>
              {data.case.rawText.slice(0, 1500)}
              {data.case.rawText.length > 1500 ? "..." : ""}
            </pre>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            disabled={acting}
            onClick={reprocess}
            className="bg-emerald-500 hover:bg-emerald-400 text-[#0a1628] font-semibold"
          >
            {acting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {acting ? t(strings.inspect.reprocessing, lang) : t(strings.inspect.reprocess, lang)}
          </Button>
          <Button
            disabled={acting}
            onClick={remove}
            variant="outline"
            className="border-red-500/40 text-red-300 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t(strings.inspect.delete, lang)}
          </Button>
        </div>
      </div>
    </main>
  );
}

function StatusPill({ status, lang }: { status: CaseStatus; lang: "en" | "bn" }) {
  const map = {
    complete: { label: t(strings.admin.statusComplete, lang), cls: "bg-emerald-500/20 text-emerald-300" },
    partial: { label: t(strings.admin.statusPartial, lang), cls: "bg-amber-500/20 text-amber-300" },
    empty: { label: t(strings.admin.statusEmpty, lang), cls: "bg-stone-600/40 text-stone-400" },
  }[status];
  return <Badge variant="secondary" className={map.cls}>{map.label}</Badge>;
}
