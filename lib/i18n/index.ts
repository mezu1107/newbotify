import en from "./translations/en"
import fr from "./translations/fr"
import ar from "./translations/ar"
import hi from "./translations/hi"
import vi from "./translations/vi"
import ngYo from "./translations/ng-yo"
import ngIg from "./translations/ng-ig"
import ngHa from "./translations/ng-ha"

import { DEFAULT_LANGUAGE, type LanguageCode } from "./config"

export type TranslationMap = Record<string, string>

const TRANSLATIONS: Record<LanguageCode, TranslationMap> = {
  en,
  fr,
  ar,
  hi,
  vi,
  "ng-yo": ngYo,
  "ng-ig": ngIg,
  "ng-ha": ngHa,
}

export function getTranslations(language: LanguageCode): TranslationMap {
  return TRANSLATIONS[language] ?? TRANSLATIONS[DEFAULT_LANGUAGE]
}

export function translate(language: LanguageCode, key: string, fallback?: string): string {
  const selected = getTranslations(language)
  const fromSelected = selected[key]
  if (fromSelected !== undefined) return fromSelected
  const fromEnglish = TRANSLATIONS[DEFAULT_LANGUAGE]?.[key]
  if (fromEnglish !== undefined) return fromEnglish
  return fallback ?? key
}
