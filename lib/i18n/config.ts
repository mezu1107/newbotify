export type LanguageCode = "en" | "fr" | "ar" | "hi" | "vi" | "ng-yo" | "ng-ig" | "ng-ha"

export const DEFAULT_LANGUAGE: LanguageCode = "en"
export const LANGUAGE_STORAGE_KEY = "app.language"

export const RTL_LANGUAGES = new Set<LanguageCode>(["ar"])

export type LanguageOption = {
  code: LanguageCode
  label: string
  labelKey: string
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "en", label: "English", labelKey: "language.english" },
  { code: "fr", label: "French", labelKey: "language.french" },
  { code: "ar", label: "Arabic", labelKey: "language.arabic" },
  { code: "hi", label: "Hindi", labelKey: "language.hindi" },
  { code: "vi", label: "Vietnamese", labelKey: "language.vietnamese" },
]

export const NIGERIAN_OPTIONS: LanguageOption[] = [
  { code: "ng-ig", label: "Igbo", labelKey: "language.igbo" },
  { code: "ng-yo", label: "Yoruba", labelKey: "language.yoruba" },
  { code: "ng-ha", label: "Hausa", labelKey: "language.hausa" },
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
