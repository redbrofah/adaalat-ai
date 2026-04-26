"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Scale, ArrowRight, Mail, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLang } from "@/lib/i18n/context";
import { useUser } from "@/lib/auth/context";
import { strings, t } from "@/lib/i18n/strings";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen grid place-items-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        </div>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, login } = useUser();
  const { lang } = useLang();

  const next = params.get("next") || "/upload";
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      // already signed in; we still let them choose continue or switch account
      setEmail(user.email);
    }
  }, [user]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setError(t(strings.login.invalidEmail, lang));
      return;
    }
    setSubmitting(true);
    login(trimmed);
    router.replace(next);
  };

  const continueAsExisting = () => {
    if (user) {
      setSubmitting(true);
      router.replace(next);
    }
  };

  const fontClass = lang === "bn" ? "font-bangla" : "";

  return (
    <main className={`min-h-screen relative overflow-hidden ${fontClass}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] via-[#0a1628] to-[#0e2236]" />
      <div className="absolute inset-0 opacity-[0.04] [background-image:radial-gradient(circle_at_1px_1px,#10b981_1px,transparent_0)] [background-size:32px_32px]" />

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

      <section className="relative z-10 max-w-md mx-auto px-6 py-20">
        <div className="rounded-2xl border border-emerald-500/15 bg-[#0e1e38]/60 p-8 backdrop-blur">
          <h1 className="font-serif text-3xl mb-2">{t(strings.login.title, lang)}</h1>
          <p className="text-sm text-stone-400 mb-8">{t(strings.login.sub, lang)}</p>

          {user && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 mb-6">
              <div className="text-xs text-stone-400 mb-1">{t(strings.login.alreadyIn, lang)}</div>
              <div className="text-sm font-mono text-emerald-300 mb-3">{user.email}</div>
              <Button
                onClick={continueAsExisting}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#0a1628] font-semibold"
                disabled={submitting}
              >
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                {t(strings.login.continueAs, lang)}
              </Button>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-stone-300 inline-flex items-center gap-2">
                <Mail className="w-4 h-4" /> {t(strings.login.emailLabel, lang)}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t(strings.login.emailPlaceholder, lang)}
                className="mt-2 bg-[#0a1628] border-emerald-500/20 text-stone-100"
                autoFocus
              />
            </div>
            {error && (
              <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {error}
              </div>
            )}
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#0a1628] font-semibold"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t(strings.login.submitting, lang)}
                </>
              ) : (
                <>
                  {user ? t(strings.login.switchAccount, lang) : t(strings.login.submit, lang)}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-emerald-500/10 text-center">
            <Link href="/demo" className="text-xs text-emerald-400/80 hover:text-emerald-300 inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> {t(strings.login.skipLink, lang)}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
