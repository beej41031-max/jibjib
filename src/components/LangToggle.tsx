"use client";
import { useT } from "@/i18n/provider";

export function LangToggle() {
  const { locale, setLocale } = useT();
  return (
    <div className="inline-flex rounded-pill border border-line bg-cream p-0.5 font-mono text-[12px]">
      {(["en", "th"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          className={`rounded-pill px-2.5 py-1 transition-colors ${
            locale === l ? "bg-ink text-cream" : "text-ink-soft"
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
