export type LanguageCode = "en" | "fr" | "ar" | "hi" | "vi" | "ng-yo" | "ng-ig" | "ng-ha"

export const DEFAULT_LANGUAGE: LanguageCode = "en"
export const LANGUAGE_STORAGE_KEY = "app.language"

export const RTL_LANGUAGES = new Set<LanguageCode>(["ar"])

export type LanguageOption = {
  code: LanguageCode
  label: string
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "en", label: "English" },
  { code: "fr", label: "French" },
  { code: "ar", label: "Arabic" },
  { code: "hi", label: "Hindi" },
  { code: "vi", label: "Vietnamese" },
]

export const NIGERIAN_OPTIONS: LanguageOption[] = [
  { code: "ng-ig", label: "Nigerian - Igbo" },
  { code: "ng-yo", label: "Nigerian - Yoruba" },
  { code: "ng-ha", label: "Nigerian - Hausa" },
]

const LANGUAGE_FALLBACKS: Record<string, LanguageCode> = {
  fr: "fr",
  ar: "ar",
  hi: "hi",
  vi: "vi",
  "ng-yo": "ng-yo",
  "ng-ig": "ng-ig",
  "ng-ha": "ng-ha",
}

export function normalizeLanguageCode(value?: string | null): LanguageCode {
  if (!value) return DEFAULT_LANGUAGE

  const normalized = value.toLowerCase()
  if (normalized in LANGUAGE_FALLBACKS) {
    return LANGUAGE_FALLBACKS[normalized]
  }

  const base = normalized.split("-")[0]
  return LANGUAGE_FALLBACKS[base] ?? DEFAULT_LANGUAGE
}
