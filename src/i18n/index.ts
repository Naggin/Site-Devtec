import { en } from "./en";
import { pt } from "./pt";
import type { Locale, Translation } from "./types";

export const STORAGE_KEY = "devtec-locale";

export const translations: Record<Locale, Translation> = {
  "pt-BR": pt,
  en,
};

export function getTranslation(locale: Locale): Translation {
  return translations[locale];
}

export function isLocale(value: string | null): value is Locale {
  return value === "pt-BR" || value === "en";
}

export function otherLocale(locale: Locale): Locale {
  return locale === "pt-BR" ? "en" : "pt-BR";
}

export type { Locale, Translation, Project } from "./types";
