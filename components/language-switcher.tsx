"use client"

import { Globe2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LANGUAGE_OPTIONS,
  NIGERIAN_OPTIONS,
  type LanguageCode,
} from "@/lib/i18n/config"
import { useI18n } from "@/lib/i18n/provider"
import { cn } from "@/lib/utils"

type LanguageSwitcherProps = {
  variant?: "header" | "drawer" | "nav"
  onSelected?: () => void
}

export function LanguageSwitcher({ variant = "header", onSelected }: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useI18n()

  const buttonStyles =
    variant === "drawer"
      ? "w-full justify-start rounded-2xl px-4 py-3 text-base font-medium"
      : variant === "nav"
        ? "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 text-slate-300 hover:-translate-y-[1px] hover:bg-slate-800/60 hover:text-white"
        : "inline-flex items-center gap-2 rounded-lg border border-slate-800/70 bg-slate-900/70 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-400/60 hover:text-white"

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code)
    onSelected?.()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant === "header" ? "ghost" : "ghost"} className={buttonStyles}>
          <Globe2 className="h-4 w-4" aria-hidden />
          <span>{t("nav.languages", "Languages")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={variant === "header" ? "end" : "start"} className="w-56">
        <DropdownMenuLabel className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {t("label.languages", "Languages")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {LANGUAGE_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.code}
            onSelect={() => handleSelect(option.code)}
            className={cn(option.code === language && "bg-accent text-accent-foreground")}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2">
            <span>{t("label.nigerian", "Nigerian")}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-56">
            {NIGERIAN_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.code}
                onSelect={() => handleSelect(option.code)}
                className={cn(option.code === language && "bg-accent text-accent-foreground")}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
