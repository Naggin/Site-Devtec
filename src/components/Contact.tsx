import { useRef, useState, type FormEvent } from "react";
import { profile, projectTypes } from "../data";
import {
  buildMailto,
  emptyInquiry,
  validateInquiry,
  type Inquiry,
  type InquiryField,
} from "../contact";

const fieldOrder: InquiryField[] = ["name", "email", "projectType", "message"];

export default function Contact() {
  const [inquiry, setInquiry] = useState<Inquiry>(emptyInquiry);
  const [errors, setErrors] = useState<Partial<Record<InquiryField, string>>>({});
  const [submitted, setSubmitted] = useState<Inquiry | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function update<K extends InquiryField>(field: K, value: Inquiry[K]) {
    setInquiry((c) => ({ ...c, [field]: value }));
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validateInquiry(inquiry);
    setErrors(errs);

    const firstInvalid = fieldOrder.find((field) => errs[field]);
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`#${firstInvalid}`)?.focus();
      return;
    }

    setSubmitted(inquiry);
  }

  const errorCount = Object.keys(errors).length;

  return (
    <section className="section section-border" id="contato">
      <div className="wrap">
        <p className="kicker reveal">05 / Contato</p>
        <h2 className="section-title reveal" data-delay="1">
          Bora construir.
        </h2>
        <p className="section-sub reveal" data-delay="2">
          Descreva o problema em duas linhas. Eu respondo com um plano — escopo,
          prazo e preço — antes de você assumir qualquer compromisso.
        </p>

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
            <p className="contact-note">
              Prefere ver antes de conversar? O código dos projetos está aberto no
              GitHub e três deles estão no ar agora.
            </p>
          </div>

          <div className="reveal" data-delay="3">
            {submitted ? (
              <SuccessCard submitted={submitted} />
            ) : (
              <form
                ref={formRef}
                className="contact-form-card"
                onSubmit={onSubmit}
                noValidate
                aria-describedby="form-status"
              >
                <p id="form-status" className="form-status" role="alert">
                  {errorCount > 0
                    ? `Faltou preencher ${errorCount} ${
                        errorCount === 1 ? "campo" : "campos"
                      }.`
                    : ""}
                </p>

                <div className="form-row">
                  <Field
                    id="name"
                    label="Nome"
                    error={errors.name}
                    autoComplete="name"
                    value={inquiry.name}
                    onChange={(v) => update("name", v)}
                  />
                  <Field
                    id="email"
                    label="E-mail"
                    type="email"
                    error={errors.email}
                    autoComplete="email"
                    value={inquiry.email}
                    onChange={(v) => update("email", v)}
                  />

                  <div className="field full">
                    <label htmlFor="projectType">Tipo de projeto</label>
                    <select
                      id="projectType"
                      name="projectType"
                      value={inquiry.projectType}
                      aria-invalid={errors.projectType ? true : undefined}
                      aria-describedby={errors.projectType ? "projectType-error" : undefined}
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
                    {errors.projectType ? (
                      <span className="error" id="projectType-error">
                        {errors.projectType}
                      </span>
                    ) : null}
                  </div>

                  <div className="field full">
                    <label htmlFor="message">O que você precisa?</label>
                    <textarea
                      id="message"
                      name="message"
                      value={inquiry.message}
                      aria-invalid={errors.message ? true : undefined}
                      aria-describedby={errors.message ? "message-error" : undefined}
                      onChange={(e) => update("message", e.target.value)}
                      placeholder="Ex.: tenho uma clínica e controlo os agendamentos no caderno."
                    />
                    {errors.message ? (
                      <span className="error" id="message-error">
                        {errors.message}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="form-foot">
                  <button className="btn btn-primary" type="submit">
                    Enviar briefing
                  </button>
                  <span className="form-foot-note">
                    Sem cadastro e sem lista de e-mail. Vai direto para mim.
                  </span>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

type FieldProps = {
  id: "name" | "email";
  label: string;
  value: string;
  error?: string;
  type?: string;
  autoComplete?: string;
  onChange: (value: string) => void;
};

function Field({ id, label, value, error, type, autoComplete, onChange }: FieldProps) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
      {error ? (
        <span className="error" id={`${id}-error`}>
          {error}
        </span>
      ) : null}
    </div>
  );
}

function SuccessCard({ submitted }: { submitted: Inquiry }) {
  return (
    <div className="success-card" role="status" data-testid="inquiry-success">
      <p className="kicker">Briefing pronto</p>
      <h3>Valeu, {submitted.name.split(" ")[0]}.</h3>
      <p>
        Falta um passo: abra o e-mail já preenchido e envie. Ele chega direto na
        minha caixa de entrada.
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
      </dl>
      <a className="btn btn-primary" href={buildMailto(submitted)}>
        Abrir no e-mail
      </a>
    </div>
  );
}
