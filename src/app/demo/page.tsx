"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Scale, ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLang } from "@/lib/i18n/context";
import { strings, t } from "@/lib/i18n/strings";

interface CaseRow {
  id: string;
  title: string;
  uploadedAt: number;
  status: "complete" | "partial" | "empty";
}

export default function DemoPage() {
  const router = useRouter();
  const { lang } = useLang();
  const [demoCase, setDemoCase] = useState<CaseRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/case")
      .then((r) => r.json())
      .then((d) => {
        const cases: CaseRow[] = d.cases ?? [];
        const complete = cases.find((c) => c.status === "complete");
        if (complete) {
          // small delay so user sees the demo loader, then redirect
          setTimeout(() => router.replace(`/case/${complete.id}/brief`), 600);
          setDemoCase(complete);
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  const fontClass = lang === "bn" ? "font-bangla" : "";

  return (
    <main className={`min-h-screen relative overflow-hidden ${fontClass}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] via-[#0a1628] to-[#0e2236]" />

      <header className="relative z-10 border-b border-emerald-500/10 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <Scale className="w-6 h-6 text-emerald-400" strokeWidth={1.5} />
            <div className="font-serif text-xl">AdaalatAI</div>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Link href="/" className="text-sm text-stone-400 hover:text-emerald-300 inline-flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> {t(strings.nav2.backHome, lang)}
            </Link>
          </div>
        </div>
      </header>

      <section className="relative z-10 max-w-2xl mx-auto px-6 py-20">
        <div className="rounded-2xl border border-emerald-500/15 bg-[#0e1e38]/60 p-10 text-center backdrop-blur">
          <Sparkles className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
          <h1 className="font-serif text-3xl mb-2">{t(strings.demo.title, lang)}</h1>
          <p className="text-stone-400 mb-8">{t(strings.demo.sub, lang)}</p>

          {loading && (
            <div className="flex items-center justify-center gap-2 text-emerald-300 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t(strings.demo.loading, lang)}
            </div>
          )}

          {!loading && demoCase && (
            <div className="space-y-4">
              <div className="text-sm text-stone-300">{demoCase.title}</div>
              <Link href={`/case/${demoCase.id}/brief`}>
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-[#0a1628] font-semibold">
                  {t(strings.demo.openBrief, lang)} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}

          {!loading && !demoCase && (
            <div className="space-y-4">
              <div className="font-medium text-amber-300">{t(strings.demo.fallbackTitle, lang)}</div>
              <p className="text-sm text-stone-400">{t(strings.demo.fallbackBody, lang)}</p>
              <Link href="/login?next=/upload">
                <Button className="bg-emerald-500 hover:bg-emerald-400 text-[#0a1628] font-semibold">
                  {t(strings.demo.runOne, lang)} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
