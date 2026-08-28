import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../i18n/useLanguage";

export default function Header() {
  const { t, locale, toggleLanguage, isTransitioning } = useLanguage();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || toggleRef.current?.contains(target)) return;
      setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  const langLabel = locale === "pt-BR" ? t.a11y.switchToEn : t.a11y.switchToPt;
  const langShort = locale === "pt-BR" ? "EN" : "PT";

  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <a className="brand" href="#topo">
          <span className="brand-icon">dt</span>
          {t.profile.brand}
        </a>

        <nav className="nav" aria-label={t.a11y.navPrimary}>
          {t.navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={item.href === "#contato" ? "nav-cta" : undefined}
            >
              {item.label}
            </a>
          ))}
          <button
            type="button"
            className="lang-toggle"
            aria-label={langLabel}
            disabled={isTransitioning}
            onClick={toggleLanguage}
          >
            <span className="lang-toggle-code" aria-hidden>{langShort}</span>
          </button>
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className="lang-toggle lang-toggle-mobile"
            aria-label={langLabel}
            disabled={isTransitioning}
            onClick={toggleLanguage}
          >
            <span className="lang-toggle-code" aria-hidden>{langShort}</span>
          </button>

          <button
            ref={toggleRef}
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="nav-mobile"
            aria-label={open ? t.a11y.closeMenu : t.a11y.openMenu}
            onClick={() => setOpen((v) => !v)}
          >
            <span className={`nav-toggle-bars${open ? " is-open" : ""}`} aria-hidden />
          </button>
        </div>
      </div>

      <div
        id="nav-mobile"
        ref={panelRef}
        className={`nav-mobile${open ? " is-open" : ""}`}
        hidden={!open}
      >
        <nav aria-label={t.a11y.navMobile}>
          {t.navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </a>
          ))}
          <button
            type="button"
            className="lang-toggle lang-toggle-menu"
            aria-label={langLabel}
            disabled={isTransitioning}
            onClick={() => {
              toggleLanguage();
              setOpen(false);
            }}
          >
            {langLabel}
          </button>
        </nav>
      </div>
    </header>
  );
}
