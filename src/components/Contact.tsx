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
    setInquiry((c) => ({ ...c, [field]: value }));
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validateInquiry(inquiry);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitted(inquiry);
  }

  return (
    <section className="section section-border" id="contato">
      <div className="wrap">
        <p className="kicker reveal">04 / Contato</p>
        <h2 className="section-title reveal" data-delay="1">
          Bora construir.
        </h2>

        <div className="contact-layout">
          <div className="contact-info reveal-left" data-delay="2">
            <p>
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
            </p>
            <p>
              <a href={profile.github} target="_blank" rel="noreferrer">
                {profile.githubLabel}
              </a>
            </p>
          </div>

          <div className="reveal" data-delay="3">
            {submitted ? (
              <SuccessCard submitted={submitted} />
            ) : (
              <form
                className="contact-form-card"
                onSubmit={onSubmit}
                noValidate
              >
                <div className="form-row">
                  <div className="field">
                    <label htmlFor="name">Nome</label>
                    <input
                      id="name"
                      name="name"
                      autoComplete="name"
                      value={inquiry.name}
                      onChange={(e) => update("name", e.target.value)}
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
                      onChange={(e) => update("email", e.target.value)}
                    />
                    {errors.email ? <span className="error">{errors.email}</span> : null}
                  </div>
                  <div className="field full">
                    <label htmlFor="projectType">Tipo de projeto</label>
                    <select
                      id="projectType"
                      name="projectType"
                      value={inquiry.projectType}
                      onChange={(e) =>
                        update("projectType", e.target.value as Inquiry["projectType"])
                      }
                    >
                      <option value="">Selecione</option>
                      {projectTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
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
                      onChange={(e) => update("message", e.target.value)}
                      placeholder="Descreva o projeto."
                    />
                    {errors.message ? <span className="error">{errors.message}</span> : null}
                  </div>
                </div>
                <div className="form-foot">
                  <button className="btn btn-primary" type="submit">
                    Enviar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function SuccessCard({ submitted }: { submitted: Inquiry }) {
  return (
    <div className="success-card" role="status" data-testid="inquiry-success">
      <p className="kicker">Briefing recebido</p>
      <h3>Valeu, {submitted.name.split(" ")[0]}.</h3>
      <p>Respondo no e-mail em breve.</p>
      <dl>
        <div>
          <dt>Tipo</dt>
          <dd>{submitted.projectType}</dd>
        </div>
        <div>
          <dt>E-mail</dt>
          <dd>{submitted.email}</dd>
        </div>
      </dl>
      <a className="btn btn-primary" href={buildMailto(submitted)}>
        Abrir no e-mail
      </a>
    </div>
  );
}
