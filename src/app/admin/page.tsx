"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Scale, ArrowLeft, FileText, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LanguageToggle } from "@/components/LanguageToggle";
import { UserMenu } from "@/components/UserMenu";
import { useLang } from "@/lib/i18n/context";
import { useLoginGuard } from "@/lib/auth/useLoginGuard";
import { strings, t } from "@/lib/i18n/strings";
import { Loader2 } from "lucide-react";
import type { CaseFile, CaseStatus } from "@/lib/types";

type CaseRow = CaseFile & { status: CaseStatus };

export default function AdminPage() {
  const { lang } = useLang();
  const { ready } = useLoginGuard();
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    fetch("/api/case")
      .then((r) => r.json())
      .then((d) => setCases(d.cases ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const cleanupTests = async () => {
    if (!confirm(t(strings.admin.confirmDelete, lang))) return;
    await fetch("/api/case?scope=smoke-tests", { method: "DELETE" });
    refresh();
  };

  const fontClass = lang === "bn" ? "font-bangla" : "";
  const hasTests = cases.some((c) => c.id.startsWith("test-"));

  return (
    <main className={`min-h-screen ${fontClass}`}>
      <header className="border-b border-emerald-500/10 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <Scale className="w-6 h-6 text-emerald-400" strokeWidth={1.5} />
            <div className="font-serif text-xl">AdaalatAI</div>
          </Link>
          <div className="flex items-center gap-3">
            <UserMenu />
            <LanguageToggle />
            <Link href="/upload">
              <Button className="bg-emerald-500 hover:bg-emerald-400 text-[#0a1628] font-semibold">
                {t(strings.nav.upload, lang)}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <Link href="/" className="text-sm text-stone-400 hover:text-emerald-300 inline-flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" /> {t(strings.nav2.backHome, lang)}
        </Link>
        <div className="flex items-end justify-between mb-10 gap-4">
          <div>
            <h1 className="font-serif text-4xl mb-2">{t(strings.admin.title, lang)}</h1>
            <p className="text-stone-400">{t(strings.admin.sub, lang)}</p>
          </div>
          {hasTests && (
            <Button
              variant="outline"
              onClick={cleanupTests}
              className="border-stone-600 text-stone-300 hover:bg-stone-800"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t(strings.admin.cleanupTests, lang)}
            </Button>
          )}
        </div>

        {!ready && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          </div>
        )}
        {ready && loading && <div className="text-stone-500">{t(strings.admin.loading, lang)}</div>}
        {!loading && cases.length === 0 && (
          <div className="rounded-xl border border-emerald-500/15 bg-[#0e1e38]/40 p-12 text-center">
            <FileText className="w-10 h-10 text-stone-500 mx-auto mb-3" />
            <div className="text-stone-300 mb-4">{t(strings.admin.empty, lang)}</div>
            <Link href="/upload">
              <Button className="bg-emerald-500 hover:bg-emerald-400 text-[#0a1628] font-semibold">
                {t(strings.admin.uploadFirst, lang)}
              </Button>
            </Link>
          </div>
        )}

        <div className="space-y-3">
          {cases.map((c) => {
            const target =
              c.status === "complete" ? `/case/${c.id}/brief` : `/case/${c.id}/inspect`;
            return (
              <Link key={c.id} href={target}>
                <div className="rounded-xl border border-emerald-500/15 bg-[#0e1e38]/60 hover:border-emerald-500/40 p-5 cursor-pointer transition group">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className={`${lang === "bn" ? "font-bangla" : ""} text-stone-100 font-medium mb-1 truncate`}>
                        {c.title}
                      </div>
                      <div className="text-xs text-stone-500 flex items-center gap-3 flex-wrap">
                        <span className="font-mono">{c.id.slice(0, 8)}</span>
                        <span>{new Date(c.uploadedAt).toLocaleString("en-GB")}</span>
                        <StatusBadge status={c.status} lang={lang} />
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-stone-500 group-hover:text-emerald-300 transition" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}

function StatusBadge({ status, lang }: { status: CaseStatus; lang: "en" | "bn" }) {
  const map = {
    complete: { label: t(strings.admin.statusComplete, lang), cls: "bg-emerald-500/20 text-emerald-300" },
    partial: { label: t(strings.admin.statusPartial, lang), cls: "bg-amber-500/20 text-amber-300" },
    empty: { label: t(strings.admin.statusEmpty, lang), cls: "bg-stone-600/40 text-stone-400" },
  }[status];
  return <Badge variant="secondary" className={map.cls}>{map.label}</Badge>;
}
