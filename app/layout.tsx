import type React from "react"
import { Suspense } from "react"
import type { Metadata } from "next"
import { cookies } from "next/headers"
import { ThemeProvider } from "@/components/theme-provider"
import { TopLoaderProvider } from "@/components/top-loader"
import { AppHeader } from "@/components/layout/app-header"
import { I18nProvider } from "@/lib/i18n/provider"
import { LANGUAGE_STORAGE_KEY, normalizeLanguageCode } from "@/lib/i18n/config"
import { cn } from "@/lib/utils"

import "./globals.css"

export const metadata: Metadata = {
  title: "5gBotify - Network Earnings Platform",
  description:
    "Join our rewards ecosystem with referral bonuses, team building, and sustainable earning opportunities.",
  generator: "v0.app",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const storedLanguage = normalizeLanguageCode(cookieStore.get(LANGUAGE_STORAGE_KEY)?.value)

  return (
    <html lang={storedLanguage} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" sizes="any" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={cn("min-h-screen bg-background font-sans antialiased text-foreground")}>
        <Suspense fallback={null}>
          <TopLoaderProvider>
            <I18nProvider initialLanguage={storedLanguage}>
              <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
                <AppHeader />
                {children}
              </ThemeProvider>
            </I18nProvider>
          </TopLoaderProvider>
        </Suspense>
      </body>
    </html>
  )
}
