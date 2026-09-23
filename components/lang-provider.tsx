"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { dict, dir } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const LangContext = createContext<LangContextValue>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
});

function langFromUrl(): Lang {
  if (typeof window === "undefined") return "en";
  return new URLSearchParams(window.location.search).get("lang") === "ar"
    ? "ar"
    : "en";
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    setLangState(langFromUrl());
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir(lang);
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", next);
    window.history.replaceState(null, "", url.toString());
  }, []);

  const t = useCallback((key: string) => dict[lang][key] ?? key, [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
