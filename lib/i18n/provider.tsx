"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  RTL_LANGUAGES,
  type LanguageCode,
  normalizeLanguageCode,
} from "./config"
import { getTranslations, translate, type TranslationMap } from "./index"

type I18nContextValue = {
  language: LanguageCode
  setLanguage: (language: LanguageCode) => void
  translations: TranslationMap
  t: (key: string, fallback?: string) => string
  isRtl: boolean
}

const I18nContext = createContext<I18nContextValue | null>(null)

function applyDocumentDirection(language: LanguageCode) {
  if (typeof document === "undefined") return
  const isRtl = RTL_LANGUAGES.has(language)
  document.documentElement.dir = isRtl ? "rtl" : "ltr"
  document.documentElement.lang = language
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE)

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    const normalized = normalizeLanguageCode(stored)
    setLanguageState(normalized)
    applyDocumentDirection(normalized)
  }, [])

  const setLanguage = useCallback((next: LanguageCode) => {
    setLanguageState(next)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next)
    }
    applyDocumentDirection(next)
  }, [])

  const translations = useMemo(() => getTranslations(language), [language])
  const t = useCallback((key: string, fallback?: string) => translate(language, key, fallback), [language])
  const isRtl = RTL_LANGUAGES.has(language)

  const value = useMemo<I18nContextValue>(
    () => ({ language, setLanguage, translations, t, isRtl }),
    [language, setLanguage, translations, t, isRtl],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider")
  }
  return context
}
