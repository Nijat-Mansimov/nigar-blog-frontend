import { en } from "./translations/en";
import { az } from "./translations/az";
import { ru } from "./translations/ru";
import { tr } from "./translations/tr";

export type Language = "en" | "az" | "ru" | "tr";

export const translations = {
  en,
  az,
  ru,
  tr,
} as const;

export const languageNames: Record<Language, string> = {
  en: "English",
  az: "Azərbaycanca",
  ru: "Русский",
  tr: "Türkçe",
};

export const getTranslation = (language: Language) => translations[language];
