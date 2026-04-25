"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import { Scale, Upload as UploadIcon, FileText, Loader2, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { LanguageToggle } from "@/components/LanguageToggle";
import { UserMenu } from "@/components/UserMenu";
import { useLang } from "@/lib/i18n/context";
import { useLoginGuard } from "@/lib/auth/useLoginGuard";
import { strings, t } from "@/lib/i18n/strings";

interface Sample {
  slug: string;
  titleEn: string;
  titleBn: string;
  preview: string;
  size: number;
}

export default function UploadPage() {
  const router = useRouter();
  const { lang } = useLang();
  const { ready } = useLoginGuard();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/samples")
      .then((r) => r.json())
      .then((d) => setSamples(d.samples ?? []))
      .catch(() => {});
  }, []);

  const onDrop = useCallback((accepted: File[]) => {
    setFiles((prev) => [...prev, ...accepted]);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
      "text/*": [".txt", ".md"],
    },
    multiple: true,
  });

  const loadSample = async (slug: string) => {
    const sample = samples.find((s) => s.slug === slug);
    if (!sample) return;
    const r = await fetch(`/api/samples/${slug}`);
    if (r.ok) {
      const d = await r.json();
      setTitle(lang === "bn" ? sample.titleBn : sample.titleEn);
      setText(d.text);
    }
  };

  const submit = async () => {
    setError(null);
    if (!text.trim() && files.length === 0) {
      setError(t(strings.upload.errorEmpty, lang));
      return;
    }
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("title", title || "Untitled case");
      form.append("text", text);
      for (const f of files) form.append("files", f);
      const res = await fetch("/api/case", { method: "POST", body: form });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const data = await res.json();
      router.push(`/case/${data.caseId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setSubmitting(false);
    }
  };

  const fontClass = lang === "bn" ? "font-bangla" : "";

  return (
    <main className={`min-h-screen ${fontClass}`}>
      <header className="border-b border-emerald-500/10 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Scale className="w-6 h-6 text-emerald-400" strokeWidth={1.5} />
            <div className="font-serif text-xl">AdaalatAI</div>
          </Link>
          <div className="flex items-center gap-4">
            <UserMenu />
            <LanguageToggle />
            <Link href="/" className="text-sm text-stone-400 hover:text-emerald-300 inline-flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> {t(strings.nav2.backHome, lang)}
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="font-serif text-4xl mb-2">{t(strings.upload.title, lang)}</h1>
        <p className="text-stone-400 mb-10">{t(strings.upload.sub, lang)}</p>

        {!ready ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          </div>
        ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <Label htmlFor="title" className="text-stone-300">{t(strings.upload.titleField, lang)}</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t(strings.upload.titlePlaceholder, lang)}
                className="mt-2 bg-[#0e1e38] border-emerald-500/20 text-stone-100"
              />
            </div>

            <div>
              <Label className="text-stone-300">{t(strings.upload.filesLabel, lang)}</Label>
              <div
                {...getRootProps()}
                className={`mt-2 border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition ${
                  isDragActive
                    ? "border-emerald-400 bg-emerald-500/10"
                    : "border-emerald-500/20 bg-[#0e1e38]/40 hover:border-emerald-500/40"
                }`}
              >
                <input {...getInputProps()} />
                <UploadIcon className="w-10 h-10 mx-auto text-emerald-400/70 mb-3" />
                <div className="text-stone-300">
                  {isDragActive ? t(strings.upload.dropActive, lang) : t(strings.upload.dropIdle, lang)}
                </div>
                <div className="text-xs text-stone-500 mt-1">{t(strings.upload.dropTypes, lang)}</div>
              </div>
              {files.length > 0 && (
                <div className="mt-3 space-y-1">
                  {files.map((f, i) => (
                    <div key={i} className="text-sm text-stone-400 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> {f.name} ({(f.size / 1024).toFixed(1)} KB)
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="text" className="text-stone-300">{t(strings.upload.textLabel, lang)}</Label>
              <Textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={12}
                placeholder={t(strings.upload.textPlaceholder, lang)}
                className="mt-2 bg-[#0e1e38] border-emerald-500/20 text-stone-100 font-bangla"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <Button
              size="lg"
              disabled={submitting}
              onClick={submit}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#0a1628] font-semibold py-6"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {t(strings.upload.submitting, lang)}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  {t(strings.upload.submit, lang)}
                </>
              )}
            </Button>
          </div>

          <div className="space-y-3">
            <h3 className="font-serif text-xl text-stone-200">{t(strings.upload.samples, lang)}</h3>
            <p className="text-xs text-stone-500 mb-4">{t(strings.upload.samplesNote, lang)}</p>
            {samples.map((s) => (
              <Card
                key={s.slug}
                onClick={() => loadSample(s.slug)}
                className="bg-[#0e1e38]/60 border-emerald-500/15 hover:border-emerald-500/40 p-4 cursor-pointer transition"
              >
                <div className={`${lang === "bn" ? "font-bangla" : ""} text-stone-200 text-sm font-medium leading-snug mb-1`}>
                  {lang === "bn" ? s.titleBn : s.titleEn}
                </div>
                <div className="text-xs text-stone-500">{(s.size / 1024).toFixed(1)} KB</div>
              </Card>
            ))}
          </div>
        </div>
        )}
      </div>
    </main>
  );
}
