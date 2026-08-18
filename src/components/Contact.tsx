import { useState, type FormEvent } from "react";
import { profile, projectTypes } from "../data";
import {
  buildMailto,
  emptyInquiry,
  validateInquiry,
  type Inquiry,
  type InquiryField,
} from "../contact";

export default function Contact() {
  const [inquiry, setInquiry] = useState<Inquiry>(emptyInquiry);
  const [errors, setErrors] = useState<Partial<Record<InquiryField, string>>>({});
  const [submitted, setSubmitted] = useState<Inquiry | null>(null);

  function update<K extends InquiryField>(field: K, value: Inquiry[K]) {
    setInquiry((current) => ({ ...current, [field]: value }));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateInquiry(inquiry);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    setSubmitted(inquiry);
  }

  return (
    <section className="section" id="contato">
      <div className="wrap">
        <p className="kicker">04 / Contato</p>
        <h2>Vamos falar do seu próximo projeto.</h2>
        <div className="contact-panel">
          <div>
            <p className="section-intro">
              Conte o que você precisa. Eu leio todo briefing e respondo com o caminho
              mais direto — prazo, abordagem e se faz sentido trabalharmos juntos.
            </p>
            <p className="section-intro">
              E-mail direto:{" "}
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
              <br />
              GitHub:{" "}
              <a href={profile.github} target="_blank" rel="noreferrer">
                {profile.githubLabel}
              </a>
            </p>
          </div>

          {submitted ? (
            <div className="success-card" role="status" data-testid="inquiry-success">
              <p className="kicker">Briefing enviado</p>
              <h3>Recebi o seu pedido, {submitted.name.split(" ")[0]}.</h3>
              <p>
                Guardei o resumo abaixo. Se o e-mail do seu aparelho abrir, a mensagem já
                vai montada para {profile.email}.
              </p>
              <dl>
                <div>
                  <dt>Tipo</dt>
                  <dd>{submitted.projectType}</dd>
                </div>
                <div>
                  <dt>E-mail</dt>
                  <dd>{submitted.email}</dd>
                </div>
                <div>
                  <dt>Mensagem</dt>
                  <dd>{submitted.message}</dd>
                </div>
              </dl>
              <a className="btn btn-primary" href={buildMailto(submitted)}>
                Abrir no e-mail
              </a>
            </div>
          ) : (
            <form className="contact-form" onSubmit={onSubmit} noValidate>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="name">Nome</label>
                  <input
                    id="name"
                    name="name"
                    autoComplete="name"
                    value={inquiry.name}
                    onChange={(event) => update("name", event.target.value)}
                  />
                  {errors.name ? <span className="error">{errors.name}</span> : null}
                </div>
                <div className="field">
                  <label htmlFor="email">E-mail</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={inquiry.email}
                    onChange={(event) => update("email", event.target.value)}
                  />
                  {errors.email ? <span className="error">{errors.email}</span> : null}
                </div>
                <div className="field full">
                  <label htmlFor="projectType">Tipo de projeto</label>
                  <select
                    id="projectType"
                    name="projectType"
                    value={inquiry.projectType}
                    onChange={(event) => update("projectType", event.target.value as Inquiry["projectType"])}
                  >
                    <option value="">Selecione</option>
                    {projectTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.projectType ? <span className="error">{errors.projectType}</span> : null}
                </div>
                <div className="field full">
                  <label htmlFor="message">O que você precisa?</label>
                  <textarea
                    id="message"
                    name="message"
                    value={inquiry.message}
                    onChange={(event) => update("message", event.target.value)}
                    placeholder="Ex.: preciso de um site para divulgar meus serviços e um formulário de orçamento."
                  />
                  {errors.message ? <span className="error">{errors.message}</span> : null}
                </div>
              </div>
              <div className="form-actions">
                <button className="btn btn-primary" type="submit">
                  Enviar briefing
                </button>
                <p className="form-note">Sem spam. Só uma conversa sobre o projeto.</p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
