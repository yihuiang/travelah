import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { UI_STRINGS } from '../i18n/ui.js'

const STORAGE_KEY = 'travelah-lang'

export const LANGUAGES = {
  en: { code: 'en', label: 'EN', name: 'English' },
  ms: { code: 'ms', label: 'MS', name: 'Melayu' },
  'zh-CN': { code: 'zh-CN', label: '中文', name: 'Mandarin 中文' },
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return LANGUAGES[saved] ? saved : 'en'
  })

  const setLanguage = useCallback((code) => {
    if (!LANGUAGES[code]) return
    setLanguageState(code)
    localStorage.setItem(STORAGE_KEY, code)
  }, [])

  const ui = UI_STRINGS[language] ?? UI_STRINGS.en

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      ui,
      languageLabel: LANGUAGES[language]?.label ?? 'EN',
    }),
    [language, setLanguage, ui],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
