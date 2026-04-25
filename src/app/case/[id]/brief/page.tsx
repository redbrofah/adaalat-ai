"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Scale, ArrowLeft, Printer, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/LanguageToggle";
import { UserMenu } from "@/components/UserMenu";
import { useLang } from "@/lib/i18n/context";
import { strings, t } from "@/lib/i18n/strings";
import type {
  CaseFile,
  ClassificationOutput,
  ConflictOutput,
  PrecedentOutput,
  DeadlineOutput,
  ReasoningOutput,
  SynthesisOutput,
  CriticReport,
} from "@/lib/types";

interface CaseData {
  case: CaseFile;
  outputs: {
    classification?: ClassificationOutput;
    conflict?: ConflictOutput;
    precedent?: PrecedentOutput;
    deadline?: DeadlineOutput;
    reasoning?: ReasoningOutput;
    synthesis?: SynthesisOutput;
    critic?: CriticReport;
  };
}

export default function BriefPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { lang } = useLang();
  const [data, setData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/case/${id}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!loading && data && (!data.case || !data.outputs.synthesis)) {
      router.replace(`/case/${id}/inspect`);
    }
  }, [loading, data, id, router]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }
  if (!data?.case || !data.outputs.synthesis) {
    return (
      <div className="min-h-screen grid place-items-center text-stone-300">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }
  const { synthesis, classification, conflict, precedent, deadline, critic } = data.outputs;
  const fontClass = lang === "bn" ? "font-bangla" : "";

  return (
    <main className={`min-h-screen bg-[#fbf8f1] text-stone-900 print:bg-white ${fontClass}`}>
      <header className="bg-[#0a1628] text-stone-100 border-b-4 border-emerald-500 print:hidden">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-sm text-stone-300 hover:text-emerald-300">
            <ArrowLeft className="w-4 h-4" /> {t(strings.brief.backHome, lang)}
          </Link>
          <div className="flex items-center gap-3">
            <Scale className="w-5 h-5 text-emerald-400" />
            <div className="font-serif text-lg">AdaalatAI</div>
          </div>
          <div className="flex items-center gap-3">
            <UserMenu />
            <LanguageToggle />
            <Button onClick={() => window.print()} variant="outline" className="border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/10 hidden sm:inline-flex">
              <Printer className="w-4 h-4 mr-2" /> {t(strings.brief.print, lang)}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12 print:py-4 print:max-w-none">
        <div className="text-center mb-10 border-b border-stone-300 pb-8">
          <div className="text-xs uppercase tracking-[0.3em] text-stone-500 mb-2">{t(strings.brief.govtHeader, lang)}</div>
          <div className="font-serif text-3xl mb-1">{data.case.title}</div>
          <div className="text-stone-500 text-sm">
            {t(strings.brief.generatedBy, lang)}: {new Date(data.case.uploadedAt).toLocaleString("en-GB")}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 print:grid-cols-4">
          {classification && (
            <Stat label={t(strings.brief.caseTypeLabel, lang)} value={classification.caseType} subValue={classification.subtype} />
          )}
          {classification && (
            <Stat label={t(strings.brief.urgencyLabel, lang)} value={`${classification.urgency}/10`} subValue={classification.estimatedComplexity} />
          )}
          {deadline && (
            <Stat label={t(strings.brief.violationsLabel, lang)} value={deadline.deadlines.filter((d) => d.isViolated).length.toString()} subValue={`${deadline.deadlines.length} ${t(strings.brief.deadlinesLabel, lang)}`} />
          )}
          {synthesis && (
            <Stat label={t(strings.brief.hoursSavedLabel, lang)} value={`~${synthesis.estimatedManualHours}`} subValue={`${synthesis.totalAgentSeconds.toFixed(0)}s ${t(strings.brief.bySecsLabel, lang)}`} />
          )}
        </div>

        <div className="mb-10">
          <BriefBody
            language={lang}
            briefText={lang === "bn" ? synthesis.briefBangla : synthesis.briefEnglish}
            draftOrder={lang === "bn" ? synthesis.draftOrderBangla : synthesis.draftOrderEnglish}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6 print:break-before-page">
          {precedent && precedent.precedents.length > 0 && (
            <PaperCard title={t(strings.brief.precedentsCited, lang)}>
              <ul className="space-y-3 text-sm">
                {precedent.precedents.map((p, i) => (
                  <li key={i} className="border-l-2 border-emerald-500 pl-3">
                    <div className="font-medium">{p.citation}</div>
                    <div className="text-stone-600 text-xs mt-1">{p.principle}</div>
                    <div className="text-stone-500 text-xs italic mt-1">{p.relevance}</div>
                  </li>
                ))}
              </ul>
            </PaperCard>
          )}
          {conflict && conflict.contradictions.length > 0 && (
            <PaperCard title={t(strings.brief.witnessConfl, lang)}>
              <ul className="space-y-3 text-sm">
                {conflict.contradictions.map((c, i) => (
                  <li key={i} className="border-l-2 border-rose-500 pl-3">
                    <div className="font-medium">
                      {c.witnessA} vs {c.witnessB}{" "}
                      <span className={`text-xs px-2 py-0.5 rounded ${c.severity === "high" ? "bg-rose-100 text-rose-700" : c.severity === "medium" ? "bg-amber-100 text-amber-700" : "bg-stone-200 text-stone-700"}`}>
                        {c.severity}
                      </span>
                    </div>
                    <div className="text-stone-600 text-xs mt-1">{c.topic}</div>
                  </li>
                ))}
              </ul>
            </PaperCard>
          )}
          {deadline && deadline.deadlines.length > 0 && (
            <PaperCard title={t(strings.brief.deadlinesLim, lang)}>
              <ul className="space-y-3 text-sm">
                {deadline.deadlines.map((d, i) => (
                  <li key={i} className={`border-l-2 pl-3 ${d.isViolated ? "border-red-500" : "border-emerald-500"}`}>
                    <div className="font-medium flex items-center justify-between">
                      <span>{d.statutoryBasis}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${d.isViolated ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {d.isViolated ? "VIOLATED" : "OK"}
                      </span>
                    </div>
                    <div className="text-stone-600 text-xs mt-1">{d.description}</div>
                  </li>
                ))}
              </ul>
            </PaperCard>
          )}
          {critic && (
            <PaperCard title={t(strings.brief.criticReport, lang)}>
              <div className="text-sm">
                <div className="mb-2">
                  {t(strings.brief.statusLabel, lang)}{" "}
                  <span className={critic.passed ? "text-emerald-700 font-medium" : "text-amber-700 font-medium"}>
                    {critic.passed ? t(strings.brief.citationsVerified, lang) : `${critic.issues.length} ${t(strings.brief.issuesFlagged, lang)}`}
                  </span>
                </div>
                {critic.issues.slice(0, 5).map((i, idx) => (
                  <div key={idx} className="text-xs text-stone-600 border-l-2 border-stone-300 pl-2 mb-1">
                    [{i.severity}] {i.agent}: {i.message}
                  </div>
                ))}
              </div>
            </PaperCard>
          )}
        </div>
      </div>

      <footer className="text-center text-xs text-stone-500 py-8 print:py-4">
        AdaalatAI · {t(strings.footer.poweredBy, lang)}
      </footer>
    </main>
  );
}

function Stat({ label, value, subValue }: { label: string; value: string; subValue?: string }) {
  return (
    <div className="rounded-lg border border-stone-300 bg-white p-4">
      <div className="text-xs uppercase tracking-wider text-stone-500">{label}</div>
      <div className="font-serif text-2xl mt-1">{value}</div>
      {subValue && <div className="text-xs text-stone-500 mt-1">{subValue}</div>}
    </div>
  );
}

function PaperCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-stone-300 bg-white p-5">
      <div className="font-serif text-xl mb-4 border-b border-stone-200 pb-2">{title}</div>
      {children}
    </div>
  );
}

function BriefBody({ language, briefText, draftOrder }: { language: "bn" | "en"; briefText: string; draftOrder: string }) {
  const fontClass = language === "bn" ? "font-bangla" : "font-serif";
  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-stone-300 bg-white p-8">
        <div className="text-xs uppercase tracking-wider text-stone-500 mb-3">
          {t(strings.brief.judgeBrief, language)}
        </div>
        <div className={`${fontClass} prose prose-stone max-w-none whitespace-pre-wrap leading-relaxed`}>
          {briefText}
        </div>
      </div>
      <div className="rounded-lg border-2 border-emerald-600 bg-emerald-50/30 p-8">
        <div className="text-xs uppercase tracking-wider text-emerald-800 mb-3">
          {t(strings.brief.draftOrder, language)}
        </div>
        <div className={`${fontClass} prose prose-stone max-w-none whitespace-pre-wrap leading-relaxed`}>
          {draftOrder}
        </div>
        <div className="mt-8 pt-6 border-t border-stone-300 flex items-end justify-between">
          <div className="text-xs text-stone-500">
            {t(strings.brief.date, language)} {new Date().toLocaleDateString("en-GB")}
          </div>
          <div className="text-center">
            <div className="border-t border-stone-700 w-48"></div>
            <div className="text-xs text-stone-500 mt-1">
              {t(strings.brief.judgeSig, language)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
