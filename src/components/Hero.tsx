import StackPanel from "./StackPanel";
import { useLanguage } from "../i18n/useLanguage";

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="hero" id="topo">
      <div className="wrap">
        <div className="hero-layout">
          <div className="hero-copy">
            <div className="hero-badge">
              <span className="hero-badge-dot" aria-hidden />
              {t.hero.badge}
            </div>

            <h1>
              <span className="line-white">{t.hero.lineWhite1}</span>
              <span className="line-red">{t.hero.lineRed}</span>
              <span className="line-white">{t.hero.lineWhite2}</span>
            </h1>

            <p className="hero-sub">
              <strong>{t.hero.subStrong}</strong>
              {t.hero.subRest}
            </p>

            <div className="hero-actions">
              <a className="btn btn-primary" href="#contato">
                {t.hero.ctaPrimary}
              </a>
              <a className="btn btn-ghost" href="#projetos">
                {t.hero.ctaSecondary}
              </a>
            </div>
          </div>

          <StackPanel />
        </div>

        <div className="scroll-hint" aria-hidden>
          <span>{t.hero.scrollHint}</span>
        </div>
      </div>
    </section>
  );
}
