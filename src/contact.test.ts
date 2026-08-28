import { describe, expect, it } from "vitest";
import { buildMailto, validateInquiry, type Inquiry } from "./contact";
import { pt } from "./i18n/pt";

const valid: Inquiry = {
  name: "Maria Silva",
  email: "maria@empresa.com",
  projectType: "Produto web / SaaS",
  message: "Preciso de um painel para o time comercial.",
};

describe("validateInquiry", () => {
  it("aceita um briefing completo", () => {
    expect(validateInquiry(valid, pt.contactErrors)).toEqual({});
  });

  it("rejeita campos vazios ou inválidos", () => {
    const errors = validateInquiry(
      {
        name: "A",
        email: "nao-e-email",
        projectType: "",
        message: "oi",
      },
      pt.contactErrors,
    );

    expect(errors.name).toBeDefined();
    expect(errors.email).toBeDefined();
    expect(errors.projectType).toBeDefined();
    expect(errors.message).toBeDefined();
  });
});

describe("buildMailto", () => {
  it("monta um mailto com assunto e corpo do briefing", () => {
    const href = buildMailto(valid, pt);

    expect(href.startsWith("mailto:antoniocjr1998@gmail.com?")).toBe(true);
    expect(decodeURIComponent(href)).toContain("Maria Silva");
    expect(decodeURIComponent(href)).toContain("Produto web / SaaS");
    expect(decodeURIComponent(href)).toContain("painel para o time comercial");
  });
});
