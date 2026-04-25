"use client";

import Link from "next/link";
import { Scale, Sparkles, Clock, Languages, ArrowRight, FileText, Shield, GitBranch, Gavel, Users, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/LanguageToggle";
import { UserMenu } from "@/components/UserMenu";
import { useLang } from "@/lib/i18n/context";
import { useUser } from "@/lib/auth/context";
import { strings, t } from "@/lib/i18n/strings";

export default function LandingPage() {
  const { lang } = useLang();
  const { user } = useUser();
  const fontClass = lang === "bn" ? "font-bangla" : "";

  const uploadHref = user ? "/upload" : "/login?next=/upload";
  const adminHref = user ? "/admin" : "/login?next=/admin";

  return (
    <main className={`min-h-screen relative overflow-hidden ${fontClass}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] via-[#0a1628] to-[#0e2236]" />
      <div className="absolute inset-0 opacity-[0.04] [background-image:radial-gradient(circle_at_1px_1px,#10b981_1px,transparent_0)] [background-size:32px_32px]" />

      <header className="relative z-10 border-b border-emerald-500/10 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scale className="w-7 h-7 text-emerald-400" strokeWidth={1.5} />
            <div>
              <div className="font-serif text-2xl tracking-wide">AdaalatAI</div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-emerald-400/70">
                {t(strings.brandTagline, lang)}
              </div>
            </div>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="#how" className="text-stone-300 hover:text-emerald-300 transition hidden md:block">{t(strings.nav.how, lang)}</Link>
            <Link href="/demo" className="text-stone-300 hover:text-emerald-300 transition hidden md:block">{t(strings.nav2.viewDemo, lang)}</Link>
            <UserMenu />
            <LanguageToggle />
            <Link href={uploadHref}>
              <Button className="bg-emerald-500 hover:bg-emerald-400 text-[#0a1628] font-semibold">
                {t(strings.nav.tryCase, lang)} <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-32">
        <div className="max-w-4xl">
          <h1 className="font-serif text-6xl md:text-7xl leading-[1.05] mb-6 text-balance">
            {t(strings.hero.titleA, lang)} <span className="text-emerald-400">{t(strings.hero.titleHl, lang)}</span> {t(strings.hero.titleB, lang)}
          </h1>
          <p className={`${lang === "bn" ? "font-bangla" : ""} text-stone-200 text-2xl md:text-3xl mb-4 leading-relaxed text-balance`}>
            {t(strings.hero.subtitle, lang)}
          </p>
          <p className="text-lg text-stone-300 max-w-2xl mb-12 leading-relaxed">
            {t(strings.hero.body, lang)}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href={uploadHref}>
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-[#0a1628] font-semibold text-base px-8 py-6">
                {t(strings.hero.cta1, lang)}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/10 text-base px-8 py-6">
                <Sparkles className="w-4 h-4 mr-2" />
                {t(strings.nav2.viewDemo, lang)}
              </Button>
            </Link>
            <Link href={adminHref}>
              <Button size="lg" variant="ghost" className="text-stone-300 hover:bg-emerald-500/10 hover:text-emerald-200 text-base px-6 py-6">
                {t(strings.hero.cta2, lang)}
              </Button>
            </Link>
          </div>

          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6">
            <Stat value="4.65M" label={t(strings.stats.pending, lang)} />
            <Stat value="1,484" label={t(strings.stats.acts, lang)} />
            <Stat value="2,048" label={t(strings.stats.scob, lang)} />
            <Stat value={t(strings.stats.perCaseValue, lang)} label={t(strings.stats.perCase, lang)} />
          </div>
        </div>
      </section>

      <section id="for-whom" className="relative z-10 border-t border-emerald-500/10 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-serif text-4xl mb-3">{t(strings.forWhom.heading, lang)}</h2>
          <p className="text-stone-400 mb-12 max-w-3xl">{t(strings.forWhom.sub, lang)}</p>
          <div className="grid md:grid-cols-3 gap-6">
            <Audience icon={<Gavel className="w-6 h-6" />} title={t(strings.forWhom.judges.title, lang)} body={t(strings.forWhom.judges.body, lang)} />
            <Audience icon={<Briefcase className="w-6 h-6" />} title={t(strings.forWhom.lawyers.title, lang)} body={t(strings.forWhom.lawyers.body, lang)} />
            <Audience icon={<Users className="w-6 h-6" />} title={t(strings.forWhom.parties.title, lang)} body={t(strings.forWhom.parties.body, lang)} />
          </div>
        </div>
      </section>

      <section id="how" className="relative z-10 border-t border-emerald-500/10 bg-[#0c1c34]/40 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-serif text-4xl mb-3">{t(strings.how.heading, lang)}</h2>
          <p className="text-stone-400 mb-12 max-w-2xl">{t(strings.how.sub, lang)}</p>
          <div className="grid md:grid-cols-3 gap-6">
            <Step n="01" title={t(strings.how.s1Title, lang)} body={t(strings.how.s1Body, lang)} />
            <Step n="02" title={t(strings.how.s2Title, lang)} body={t(strings.how.s2Body, lang)} />
            <Step n="03" title={t(strings.how.s3Title, lang)} body={t(strings.how.s3Body, lang)} />
          </div>
        </div>
      </section>

      <section id="agents" className="relative z-10 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-serif text-4xl mb-3">{t(strings.agentsSection.heading, lang)}</h2>
          <p className="text-stone-400 mb-12 max-w-2xl">{t(strings.agentsSection.sub, lang)}</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AgentTile icon={<FileText className="w-5 h-5" />} name={t(strings.agents.vision.name, lang)} desc={t(strings.agents.vision.desc, lang)} />
            <AgentTile icon={<Sparkles className="w-5 h-5" />} name={t(strings.agents.classification.name, lang)} desc={t(strings.agents.classification.desc, lang)} />
            <AgentTile icon={<GitBranch className="w-5 h-5" />} name={t(strings.agents.conflict.name, lang)} desc={t(strings.agents.conflict.desc, lang)} />
            <AgentTile icon={<Scale className="w-5 h-5" />} name={t(strings.agents.precedent.name, lang)} desc={t(strings.agents.precedent.desc, lang)} />
            <AgentTile icon={<Clock className="w-5 h-5" />} name={t(strings.agents.deadline.name, lang)} desc={t(strings.agents.deadline.desc, lang)} />
            <AgentTile icon={<Sparkles className="w-5 h-5" />} name={t(strings.agents.reasoning.name, lang)} desc={t(strings.agents.reasoning.desc, lang)} />
            <AgentTile icon={<Languages className="w-5 h-5" />} name={t(strings.agents.translation.name, lang)} desc={t(strings.agents.translation.desc, lang)} />
            <AgentTile icon={<FileText className="w-5 h-5" />} name={t(strings.agents.synthesis.name, lang)} desc={t(strings.agents.synthesis.desc, lang)} />
            <AgentTile icon={<Shield className="w-5 h-5" />} name={t(strings.agents.critic.name, lang)} desc={t(strings.agents.critic.desc, lang)} />
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-emerald-500/10 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-emerald-500/60" />
            <span>{t(strings.footer.poweredBy, lang)}</span>
          </div>
          <div>{t(strings.footer.hackathon, lang)}</div>
        </div>
      </footer>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-serif text-3xl text-emerald-300">{value}</div>
      <div className="text-xs uppercase tracking-wider text-stone-400 mt-1">{label}</div>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-emerald-500/15 bg-[#0e1e38]/60 p-6">
      <div className="text-emerald-400/80 font-mono text-sm mb-3">{n}</div>
      <div className="font-serif text-2xl mb-2">{title}</div>
      <div className="text-sm text-stone-300 leading-relaxed">{body}</div>
    </div>
  );
}

function Audience({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-emerald-500/15 bg-[#0e1e38]/60 p-6">
      <div className="text-emerald-400 mb-4">{icon}</div>
      <div className="font-serif text-xl mb-2">{title}</div>
      <div className="text-sm text-stone-300 leading-relaxed">{body}</div>
    </div>
  );
}

function AgentTile({ icon, name, desc }: { icon: React.ReactNode; name: string; desc: string }) {
  return (
    <div className="rounded-xl border border-emerald-500/15 bg-[#0e1e38]/60 p-5 hover:border-emerald-500/40 transition">
      <div className="flex items-center gap-2 mb-3">
        <div className="text-emerald-400">{icon}</div>
        <div className="font-medium">{name}</div>
      </div>
      <div className="text-sm text-stone-300">{desc}</div>
    </div>
  );
}
