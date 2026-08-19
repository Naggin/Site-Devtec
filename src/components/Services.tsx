import { services } from "../data";

export default function Services() {
  return (
    <section className="section section-border" id="servicos">
      <div className="wrap">
        <p className="kicker reveal">02 / Serviços</p>
        <h2 className="section-title reveal" data-delay="1">
          O que eu construo.
        </h2>
        <p className="section-sub reveal" data-delay="2">
          Do site de lançamento ao sistema que o time abre todo dia.
        </p>

        <div className="service-grid">
          {services.map((service, i) => (
            <article
              className="service-card reveal"
              key={service.code}
              data-delay={String((i % 3) + 1)}
            >
              <p className="service-num">{service.code}</p>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
