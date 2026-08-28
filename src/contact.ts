import { profile } from "./data";
import type { Translation } from "./i18n/types";

export type Inquiry = {
  name: string;
  email: string;
  projectType: string;
  message: string;
};

export type InquiryField = keyof Inquiry;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateInquiry(
  inquiry: Inquiry,
  errors: Translation["contactErrors"],
): Partial<Record<InquiryField, string>> {
  const result: Partial<Record<InquiryField, string>> = {};

  if (inquiry.name.trim().length < 2) {
    result.name = errors.name;
  }

  if (!emailPattern.test(inquiry.email.trim())) {
    result.email = errors.email;
  }

  if (!inquiry.projectType) {
    result.projectType = errors.projectType;
  }

  if (inquiry.message.trim().length < 12) {
    result.message = errors.message;
  }

  return result;
}

export function buildMailto(inquiry: Inquiry, t: Translation): string {
  const subject = encodeURIComponent(
    t.mailto.subject(inquiry.projectType || "", inquiry.name.trim()),
  );
  const body = encodeURIComponent(
    [
      `${t.mailto.bodyLabels.name}: ${inquiry.name.trim()}`,
      `${t.mailto.bodyLabels.email}: ${inquiry.email.trim()}`,
      `${t.mailto.bodyLabels.type}: ${inquiry.projectType}`,
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
