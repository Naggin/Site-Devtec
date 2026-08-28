import DependencyGraph from "./DependencyGraph";
import BentoGrid from "./BentoGrid";
import StatusBoard from "./StatusBoard";
import { useLanguage } from "../i18n/useLanguage";

export default function About() {
  const { t } = useLanguage();

  return (
    <section className="section section-border" id="sobre">
      <div className="wrap">
        <p className="kicker reveal">{t.sections.about.kicker}</p>
        <h2 className="section-title reveal" data-delay="1">
          {t.sections.about.title}
        </h2>
        <p className="section-sub reveal" data-delay="2">
          {t.sections.about.sub}
        </p>

        <DependencyGraph />

        <div className="about-showcase">
          <BentoGrid />
          <StatusBoard />
        </div>
      </div>
    </section>
  );
}
