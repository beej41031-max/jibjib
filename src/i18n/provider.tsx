"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { messages, type Locale } from "./messages";

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const LocaleContext = createContext<Ctx | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("jibjib.locale");
      if (saved === "en" || saved === "th") setLocaleState(saved);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem("jibjib.locale", l);
      document.cookie = `jibjib.locale=${l}; path=/; max-age=31536000`;
    } catch {}
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      let s = messages[locale][key] ?? messages.en[key] ?? key;
      if (vars)
        for (const [k, v] of Object.entries(vars))
          s = s.replace(`{${k}}`, String(v));
      return s;
    },
    [locale]
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      <div className={locale === "th" ? "font-thai" : "font-sans"}>
        {children}
      </div>
    </LocaleContext.Provider>
  );
}

export function useT() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useT must be used within LocaleProvider");
  return ctx;
}
