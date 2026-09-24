import { profile } from "../data";
import { useLanguage } from "../i18n/useLanguage";

export default function About() {
  const { t } = useLanguage();
  const about = t.sections.about;
  const facts = [
    { value: String(t.projects.length), label: about.projectsFact },
    ...about.facts,
  ];

  return (
    <section className="section section-border" id="sobre">
      <div className="wrap">
        <p className="kicker reveal">{about.kicker}</p>
        <h2 className="section-title reveal" data-delay="1">
          {about.title}
        </h2>

        <div className="about-layout">
          <div className="about-copy reveal" data-delay="2">
            {about.paragraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}

            <div className="about-founder">
              <span className="about-founder-label">{about.founderLabel}</span>
              <strong>{profile.name}</strong>
              <span>
                {about.founderRole} ·{" "}
                <a href={profile.github} target="_blank" rel="noreferrer">
                  {profile.githubLabel}
                </a>
              </span>
            </div>
          </div>

          <ul className="about-facts">
            {facts.map((fact, i) => (
              // Chave pelo índice: o texto muda com o idioma, e remontar o `.reveal`
              // o faria perder o `.visible` e sumir depois da troca.
              <li className="about-fact reveal" data-delay={String(i + 1)} key={i}>
                <span className="about-fact-value">{fact.value}</span>
                <span className="about-fact-label">{fact.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
