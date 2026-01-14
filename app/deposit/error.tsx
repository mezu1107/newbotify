"use client"

import Link from "next/link"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useI18n } from "@/lib/i18n/provider"

interface DepositErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DepositError({ error, reset }: DepositErrorProps) {
  const { t } = useI18n()

  useEffect(() => {
    console.error("Deposit page runtime error", error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="max-w-lg border-border/60 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">{t("deposit.error.title", "Unable to load Deposit page")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t(
              "deposit.error.subtitle",
              "We hit a snag while loading your deposit experience. You can retry or go back to the dashboard.",
            )}
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="rounded-md border border-border/60 bg-muted/40 p-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{t("deposit.error.message_label", "Error message")}</p>
            <p>{error.message || t("deposit.error.unknown", "Unknown error")}</p>
            {error.digest ? <p className="mt-1 text-xs">{t("deposit.error.reference", "Reference: ")}{error.digest}</p> : null}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <Button variant="outline" onClick={reset} className="sm:w-auto">
              {t("deposit.error.retry", "Try again")}
            </Button>
            <Button asChild className="sm:w-auto">
              <Link href="/dashboard">{t("deposit.error.back", "Return to dashboard")}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
