import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import FragmentTransition from "../components/FragmentTransition";
import {
  getTranslation,
  isLocale,
  otherLocale,
  STORAGE_KEY,
  type Locale,
} from "./index";
import { LanguageContext } from "./useLanguage";

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return "pt-BR";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isLocale(stored)) return stored;
  } catch {
    /* ignore */
  }
  return "pt-BR";
}

function updateDocumentMeta(locale: Locale) {
  const t = getTranslation(locale);
  document.documentElement.lang = t.meta.lang;
  document.title = t.meta.title;

  const setMeta = (selector: string, value: string) => {
    const el = document.querySelector<HTMLMetaElement>(selector);
    if (el) el.content = value;
  };

  setMeta('meta[name="description"]', t.meta.description);
  setMeta('meta[property="og:locale"]', t.meta.ogLocale);
  setMeta('meta[property="og:title"]', t.meta.title);
  setMeta('meta[property="og:description"]', t.meta.ogDescription);
  setMeta('meta[property="og:image:alt"]', t.meta.ogImageAlt);
  setMeta('meta[name="twitter:title"]', t.meta.title);
  setMeta('meta[name="twitter:description"]', t.meta.ogDescription);

  const ld = document.querySelector<HTMLScriptElement>('script[type="application/ld+json"]');
  if (ld?.textContent) {
    try {
      const json = JSON.parse(ld.textContent) as {
        mainEntity?: { jobTitle?: string };
      };
      if (json.mainEntity) json.mainEntity.jobTitle = t.meta.jobTitle;
      ld.textContent = JSON.stringify(json);
    } catch {
      /* ignore */
    }
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const reducedMotion = usePrefersReducedMotion();
  const [locale, setLocale] = useState<Locale>(readStoredLocale);
  const [pendingLocale, setPendingLocale] = useState<Locale | null>(null);
  const [phase, setPhase] = useState<"idle" | "out" | "clean" | "in">("idle");
  const scrollYRef = useRef(0);
  const announceRef = useRef<HTMLDivElement>(null);

  const t = useMemo(() => getTranslation(locale), [locale]);
  const isTransitioning = phase !== "idle";

  useEffect(() => {
    updateDocumentMeta(locale);
  }, [locale]);

  useEffect(() => {
    document.body.classList.toggle("language-transitioning", isTransitioning);
    document.body.dataset.langPhase = phase;
    return () => {
      document.body.classList.remove("language-transitioning");
      delete document.body.dataset.langPhase;
    };
  }, [isTransitioning, phase]);

  const finishTransition = useCallback(() => {
    setPhase("idle");
    setPendingLocale(null);
    window.scrollTo(0, scrollYRef.current);
  }, []);

  const applyLocale = useCallback((next: Locale) => {
    setLocale(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    updateDocumentMeta(next);

    const msg =
      next === "en"
        ? getTranslation("en").a11y.languageChangedEn
        : getTranslation("pt-BR").a11y.languageChanged;
    if (announceRef.current) announceRef.current.textContent = msg;
  }, []);

  const toggleLanguage = useCallback(() => {
    if (phase !== "idle") return;

    const next = otherLocale(locale);
    scrollYRef.current = window.scrollY;

    if (reducedMotion) {
      applyLocale(next);
      return;
    }

    setPendingLocale(next);
    setPhase("out");
  }, [applyLocale, locale, phase, reducedMotion]);

  const handlePhaseChange = useCallback(
    (nextPhase: typeof phase) => {
      if (nextPhase === "clean" && pendingLocale) {
        applyLocale(pendingLocale);
      }
      setPhase(nextPhase);
    },
    [applyLocale, pendingLocale],
  );

  const value = useMemo(
    () => ({ locale, t, toggleLanguage, isTransitioning }),
    [locale, t, toggleLanguage, isTransitioning],
  );

  return (
    <LanguageContext.Provider value={value}>
      <div
        ref={announceRef}
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />
      <div className={`app-shell${isTransitioning ? " is-transitioning" : ""}`}>
        {children}
      </div>
      {!reducedMotion && phase !== "idle" ? (
        <FragmentTransition
          phase={phase}
          onPhaseChange={handlePhaseChange}
          onComplete={finishTransition}
        />
      ) : null}
    </LanguageContext.Provider>
  );
}
