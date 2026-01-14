"use client"

import { useEffect } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useI18n } from "@/lib/i18n/provider"

interface TeamErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function TeamError({ error, reset }: TeamErrorProps) {
  const { t } = useI18n()

  useEffect(() => {
    console.error("Team page runtime error", error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="max-w-lg border-border/60 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">{t("team.error.title", "Something went wrong")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("team.error.subtitle", "We could not load the team experience right now. The issue has been logged for review.")}
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="rounded-md border border-border/60 bg-muted/40 p-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{t("team.error.message_label", "Error message")}</p>
            <p>{error.message || t("team.error.unknown", "Unknown error")}</p>
            {error.digest ? <p className="mt-1 text-xs">{t("team.error.reference", "Reference: ")}{error.digest}</p> : null}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <Button variant="outline" onClick={reset} className="sm:w-auto">
              {t("team.error.retry", "Try again")}
            </Button>
            <Button asChild className="sm:w-auto">
              <Link href="/dashboard">{t("team.error.back", "Return to dashboard")}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
