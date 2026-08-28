import { useRef, useState, type FormEvent } from "react";
import { profile } from "../data";
import {
  buildMailto,
  emptyInquiry,
  validateInquiry,
  type Inquiry,
  type InquiryField,
} from "../contact";
import { useLanguage } from "../i18n/useLanguage";

const fieldOrder: InquiryField[] = ["name", "email", "projectType", "message"];

export default function Contact() {
  const { t } = useLanguage();
  const [inquiry, setInquiry] = useState<Inquiry>(emptyInquiry);
  const [errors, setErrors] = useState<Partial<Record<InquiryField, string>>>({});
  const [submitted, setSubmitted] = useState<Inquiry | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function update<K extends InquiryField>(field: K, value: Inquiry[K]) {
    setInquiry((c) => ({ ...c, [field]: value }));
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validateInquiry(inquiry, t.contactErrors);
    setErrors(errs);

    const firstInvalid = fieldOrder.find((field) => errs[field]);
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`#${firstInvalid}`)?.focus();
      return;
    }

    setSubmitted(inquiry);
  }

  const errorCount = Object.keys(errors).length;
  const c = t.sections.contact;

  return (
    <section className="section section-border" id="contato">
      <div className="wrap">
        <p className="kicker reveal">{c.kicker}</p>
        <h2 className="section-title reveal" data-delay="1">
          {c.title}
        </h2>
        <p className="section-sub reveal" data-delay="2">
          {c.sub}
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
            <p className="contact-note">{c.note}</p>
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
                  {errorCount > 0 ? c.missingFields(errorCount) : ""}
                </p>

                <div className="form-row">
                  <Field
                    id="name"
                    label={c.nameLabel}
                    error={errors.name}
                    autoComplete="name"
                    value={inquiry.name}
                    onChange={(v) => update("name", v)}
                  />
                  <Field
                    id="email"
                    label={c.emailLabel}
                    type="email"
                    error={errors.email}
                    autoComplete="email"
                    value={inquiry.email}
                    onChange={(v) => update("email", v)}
                  />

                  <div className="field full">
                    <label htmlFor="projectType">{c.projectTypeLabel}</label>
                    <select
                      id="projectType"
                      name="projectType"
                      value={inquiry.projectType}
                      aria-invalid={errors.projectType ? true : undefined}
                      aria-describedby={errors.projectType ? "projectType-error" : undefined}
                      onChange={(e) => update("projectType", e.target.value)}
                    >
                      <option value="">{c.selectPlaceholder}</option>
                      {t.projectTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
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
                    <label htmlFor="message">{c.messageLabel}</label>
                    <textarea
                      id="message"
                      name="message"
                      value={inquiry.message}
                      aria-invalid={errors.message ? true : undefined}
                      aria-describedby={errors.message ? "message-error" : undefined}
                      onChange={(e) => update("message", e.target.value)}
                      placeholder={c.messagePlaceholder}
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
                    {c.submit}
                  </button>
                  <span className="form-foot-note">{c.footNote}</span>
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
  const { t } = useLanguage();
  const c = t.sections.contact;

  return (
    <div className="success-card" role="status" data-testid="inquiry-success">
      <p className="kicker">{c.successKicker}</p>
      <h3>{c.successTitle(submitted.name.split(" ")[0] ?? submitted.name)}</h3>
      <p>{c.successBody}</p>
      <dl>
        <div>
          <dt>{c.successType}</dt>
          <dd>{submitted.projectType}</dd>
        </div>
        <div>
          <dt>{c.successEmail}</dt>
          <dd>{submitted.email}</dd>
        </div>
      </dl>
      <a className="btn btn-primary" href={buildMailto(submitted, t)}>
        {c.openEmail}
      </a>
    </div>
  );
}
