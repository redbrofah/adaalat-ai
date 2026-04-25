"use client";

import { useLang } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLang();
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-emerald-500/25 bg-[#0a1628]/60 p-0.5 text-xs",
        className,
      )}
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLang("en")}
        className={cn(
          "px-3 py-1 rounded-full transition font-medium",
          lang === "en"
            ? "bg-emerald-500 text-[#0a1628]"
            : "text-stone-300 hover:text-emerald-200",
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("bn")}
        className={cn(
          "px-3 py-1 rounded-full transition font-bangla",
          lang === "bn"
            ? "bg-emerald-500 text-[#0a1628]"
            : "text-stone-300 hover:text-emerald-200",
        )}
      >
        বাংলা
      </button>
    </div>
  );
}
