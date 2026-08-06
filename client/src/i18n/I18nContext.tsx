import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import { LANGS, type Lang, translations } from "./translations";

type I18nContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "ski-lang";

function detectInitialLang(): Lang {
  if (typeof window === "undefined") return "es";
  // La URL manda: /es/..., /en/..., /pt/... En rutas sin prefijo (ej. /admin)
  // caemos a la preferencia guardada o al idioma del navegador.
  const firstSegment = window.location.pathname.split("/").filter(Boolean)[0];
  if (firstSegment && LANGS.includes(firstSegment as Lang)) {
    return firstSegment as Lang;
  }
  const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
  if (stored && LANGS.includes(stored)) return stored;
  const browser = navigator.language.slice(0, 2).toLowerCase();
  if (browser === "en") return "en";
  if (browser === "pt") return "pt";
  return "es";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => detectInitialLang());
  const [rawLocation] = useLocation();

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem(STORAGE_KEY, newLang);
    document.documentElement.lang = newLang;
  }, []);

  // Mantiene `lang` sincronizado con la URL real (útil para navegación con
  // atrás/adelante del navegador, o links directos a /en/... o /pt/...).
  // Rutas sin prefijo de idioma (ej. /admin) no tocan el idioma actual.
  useEffect(() => {
    const firstSegment = rawLocation.split("/").filter(Boolean)[0];
    if (firstSegment && LANGS.includes(firstSegment as Lang) && firstSegment !== lang) {
      setLangState(firstSegment as Lang);
      localStorage.setItem(STORAGE_KEY, firstSegment);
    }
  }, [rawLocation, lang]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback(
    (key: string) => {
      const dict = translations[lang];
      return dict[key] ?? translations.es[key] ?? key;
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
