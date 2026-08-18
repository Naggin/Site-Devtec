import { profile, type ProjectType } from "./data";

export type Inquiry = {
  name: string;
  email: string;
  projectType: ProjectType | "";
  message: string;
};

export type InquiryField = keyof Inquiry;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateInquiry(inquiry: Inquiry): Partial<Record<InquiryField, string>> {
  const errors: Partial<Record<InquiryField, string>> = {};

  if (inquiry.name.trim().length < 2) {
    errors.name = "Informe seu nome.";
  }

  if (!emailPattern.test(inquiry.email.trim())) {
    errors.email = "Informe um e-mail válido.";
  }

  if (!inquiry.projectType) {
    errors.projectType = "Escolha o tipo de projeto.";
  }

  if (inquiry.message.trim().length < 12) {
    errors.message = "Conte um pouco mais sobre o que você precisa.";
  }

  return errors;
}

export function buildMailto(inquiry: Inquiry): string {
  const subject = encodeURIComponent(
    `[Devtec] ${inquiry.projectType || "Novo projeto"} — ${inquiry.name.trim()}`,
  );
  const body = encodeURIComponent(
    [
      `Nome: ${inquiry.name.trim()}`,
      `E-mail: ${inquiry.email.trim()}`,
      `Tipo: ${inquiry.projectType}`,
      "",
      inquiry.message.trim(),
    ].join("\n"),
  );

  return `mailto:${profile.email}?subject=${subject}&body=${body}`;
}

export const emptyInquiry = (): Inquiry => ({
  name: "",
  email: "",
  projectType: "",
  message: "",
});
