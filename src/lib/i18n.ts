import { createContext, useContext } from "react"

export type Lang = "en" | "id"

export const LangCtx = createContext<{
  lang: Lang
  setLang: (l: Lang) => void
}>({ lang: "en", setLang: () => {} })

export function useLang() {
  const { lang, setLang } = useContext(LangCtx)
  function t(en: string, id: string): string {
    return lang === "id" ? id : en
  }
  return { lang, setLang, t }
}
