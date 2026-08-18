import { services } from "../data";

export default function Services() {
  return (
    <section className="section" id="servicos">
      <div className="wrap">
        <p className="kicker">02 / Serviços</p>
        <h2>O que eu construo com você.</h2>
        <p className="section-intro">
          Do site de divulgação ao sistema que o time abre todo dia. Cada projeto começa
          com uma conversa objetiva sobre o que precisa funcionar.
        </p>
        <div className="service-grid">
          {services.map((service) => (
            <article className="service-card" key={service.code}>
              <code>{service.code}</code>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
