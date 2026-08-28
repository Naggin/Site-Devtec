import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import DustTransition, { SWEEP_MS, type Phase } from "../components/DustTransition";
import { clearPieces, markPieces, sampleViewport, type DustSample } from "../lib/dustSample";
import {
  getTranslation,
  isLocale,
  otherLocale,
  STORAGE_KEY,
  type Locale,
} from "./index";
import { LanguageContext } from "./useLanguage";

/** Abaixo disso não há tinta suficiente na tela para a poeira convencer. */
const MIN_PARTICLES = 80;

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
  const [phase, setPhase] = useState<Phase | "idle">("idle");
  const [sample, setSample] = useState<DustSample | null>(null);
  const pendingRef = useRef<Locale | null>(null);
  const markedRef = useRef<HTMLElement[]>([]);
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

  // Se o componente desmontar no meio da transição, as peças ficariam invisíveis.
  useEffect(() => () => clearPieces(markedRef.current), []);

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

    // Síncrono: a poeira começa no mesmo frame do clique, sem espera.
    const shot = sampleViewport();
    if (shot.particles.length < MIN_PARTICLES) {
      applyLocale(next);
      return;
    }

    pendingRef.current = next;
    markPieces(shot.pieces, SWEEP_MS, shot.W, shot.H);
    markedRef.current = shot.pieces;
    setSample(shot);
    setPhase("out");
  }, [applyLocale, locale, phase, reducedMotion]);

  /**
   * Fim do "out": as peças já estão em opacity 0, então a troca de idioma e o
   * reflow acontecem fora da vista. `flushSync` garante que o novo texto esteja
   * no DOM antes de medirmos o layout de chegada.
   */
  const handleSwap = useCallback((): DustSample | null => {
    const next = pendingRef.current;
    if (!next) return null;
    pendingRef.current = null;

    flushSync(() => {
      applyLocale(next);
    });
    window.scrollTo(0, scrollYRef.current);

    clearPieces(markedRef.current);
    const shot = sampleViewport();
    markPieces(shot.pieces, SWEEP_MS, shot.W, shot.H);
    markedRef.current = shot.pieces;
    return shot;
  }, [applyLocale]);

  const finishTransition = useCallback(() => {
    clearPieces(markedRef.current);
    markedRef.current = [];
    setPhase("idle");
    setSample(null);
  }, []);

  const value = useMemo(
    () => ({ locale, t, toggleLanguage, isTransitioning }),
    [locale, t, toggleLanguage, isTransitioning],
  );

  const shellClass = [
    "app-shell",
    isTransitioning ? "is-transitioning" : "",
    phase === "out" || phase === "swap" ? "is-dusting" : "",
    // Durante o swap as peças são remarcadas para o novo layout; sem cortar a
    // transição, uma peça recém-marcada faria um fade fantasma de 300ms.
    phase === "swap" ? "is-instant" : "",
    phase === "in" ? "is-reforming" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <LanguageContext.Provider value={value}>
      <div
        ref={announceRef}
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />
      <div className={shellClass}>{children}</div>
      {sample && phase !== "idle" ? (
        <DustTransition
          phase={phase}
          sample={sample}
          onSwap={handleSwap}
          onPhaseChange={setPhase}
          onComplete={finishTransition}
        />
      ) : null}
    </LanguageContext.Provider>
  );
}
