"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Sparkles, Clock4, CheckCircle2 } from "lucide-react"
import { useI18n } from "@/lib/i18n/provider"

interface MissionStatus {
  canClaim: boolean
  nextEligibleAt: string | null
  currentBalance: number
  lastRewardAmount?: number | null
  lastClaimedAt?: string | null
  depositTotal?: number
  minDepositRequired?: number
  meetsDepositRequirement?: boolean
}

export function DailyProfitMission() {
  const { t } = useI18n()
  const [status, setStatus] = useState<MissionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [cooldownDisplay, setCooldownDisplay] = useState<string>("")

  const fetchStatus = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/missions/daily-profit/status", { cache: "no-store" })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data?.error || t("missions.daily.error.load", "Failed to load mission status"))
      }

      const minDepositRequired = Number(data?.minDepositRequired ?? 50)
      const depositTotal = Number(data?.depositTotal ?? 0)

      setStatus({
        canClaim: Boolean(data.canClaim),
        nextEligibleAt: data.nextEligibleAt ?? null,
        currentBalance: Number(data.currentBalance ?? 0),
        lastRewardAmount: data.lastRewardAmount ?? null,
        lastClaimedAt: data.lastClaimedAt ?? null,
        depositTotal,
        minDepositRequired,
        meetsDepositRequirement:
          typeof data?.meetsDepositRequirement === "boolean"
            ? Boolean(data.meetsDepositRequirement)
            : depositTotal >= minDepositRequired,
      })
    } catch (err: any) {
      setError(err?.message || t("missions.daily.error.load", "Failed to load mission status"))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void fetchStatus()
  }, [fetchStatus])

  useEffect(() => {
    if (!status?.nextEligibleAt) {
      setCooldownDisplay("")
      return
    }

    const next = new Date(status.nextEligibleAt).getTime()
    const updateCountdown = () => {
      const now = Date.now()
      const diff = next - now
      if (diff <= 0) {
        setCooldownDisplay("")
        return
      }
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setCooldownDisplay(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`,
      )
    }

    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [status?.nextEligibleAt])

  const handleComplete = async () => {
    if (!status?.canClaim) return
    if (status.meetsDepositRequirement === false) {
      const minimum = status.minDepositRequired ?? 50
      setError(
        `${t("missions.daily.error.deposit_prefix", "Deposit at least $")}${minimum}${t(
          "missions.daily.error.deposit_suffix",
          " to start this mission.",
        )}`,
      )
      return
    }
    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      const idKey = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `mission-${Date.now()}`
      const response = await fetch("/api/missions/daily-profit/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idKey,
        },
      })
      const data = await response.json().catch(() => ({}))
      if (response.ok) {
        setSuccess(data?.message ?? t("missions.daily.success.rewarded", "Rewarded"))
        setStatus((prev) =>
          prev
            ? {
                ...prev,
                canClaim: false,
                nextEligibleAt: data?.nextEligibleAt ?? prev.nextEligibleAt,
                currentBalance: Number(data?.newBalance ?? prev.currentBalance),
                lastRewardAmount: Number(data?.rewardAmount ?? prev.lastRewardAmount ?? 0),
                lastClaimedAt: new Date().toISOString(),
              }
            : null,
        )
      } else if (response.status === 403) {
        const message =
          data?.error ??
          `${t("missions.daily.error.deposit_prefix", "Deposit at least $")}${status?.minDepositRequired ?? 50}${t(
            "missions.daily.error.deposit_suffix",
            " to start this mission.",
          )}`
        setError(message)
        setStatus((prev) =>
          prev
            ? {
                ...prev,
                canClaim: false,
                meetsDepositRequirement: false,
              }
            : prev,
        )
      } else if (response.status === 429 || response.status === 409) {
        setError(data?.error ?? t("missions.daily.error.cooldown", "Cooldown active. Try again later."))
        setStatus((prev) =>
          prev
            ? {
                ...prev,
                canClaim: false,
                nextEligibleAt: data?.nextEligibleAt ?? prev.nextEligibleAt,
              }
            : prev,
        )
      } else {
        setError(data?.error ?? t("missions.daily.error.unable", "Unable to complete mission"))
      }
    } catch (err: any) {
      setError(err?.message || t("missions.daily.error.unable", "Unable to complete mission"))
    } finally {
      setSubmitting(false)
    }
  }

  const eligibilityLabel = useMemo(() => {
    if (!status) return ""
    if (status.meetsDepositRequirement === false) {
      const minimum = status.minDepositRequired ?? 50
      const deposited = Number(status.depositTotal ?? 0).toFixed(0)
      return `${t("missions.daily.eligibility.deposit_prefix", "Deposit $")}${minimum}${t(
        "missions.daily.eligibility.deposit_current",
        " (current $",
      )}${deposited})`
    }
    if (!status) return ""
    if (status.canClaim) return t("missions.daily.eligibility.available_now", "Available now")
    if (cooldownDisplay) return `${t("missions.daily.eligibility.cooldown", "Cooldown ")}${cooldownDisplay}`
    return t("missions.daily.eligibility.refreshing", "Refreshing...")
  }, [cooldownDisplay, status, t])

  const minDepositRequired = status?.minDepositRequired ?? 50
  const depositTotal = status?.depositTotal ?? 0
  const meetsDepositRequirement = status?.meetsDepositRequirement ?? true
  const actionDisabled = !status?.canClaim || submitting || loading || !meetsDepositRequirement

  return (
    <Card className="col-span-full rounded-2xl border border-emerald-500/20 bg-slate-950/70 shadow-lg shadow-emerald-500/10">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-3 text-slate-100">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-emerald-400/40 bg-emerald-500/10 text-emerald-200">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-emerald-200">
              {t("missions.daily.title", "Daily Profit Mission")}
            </p>
            <span className="text-lg font-semibold text-white">
              {t("missions.daily.subtitle", "Claim your 2.5% reward")}
            </span>
          </div>
        </CardTitle>
        <Badge variant={status?.canClaim ? "default" : "outline"} className="text-[11px]">
          {eligibilityLabel || t("missions.daily.status", "Status")}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="border-emerald-500/40 bg-emerald-500/10 text-emerald-50">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-800/70 bg-slate-900/70 p-4">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>{t("missions.daily.card.eligibility", "Eligibility")}</span>
              <Clock4 className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">
              {!meetsDepositRequirement
                ? t("missions.daily.card.deposit_required", "Deposit required")
                : status?.canClaim
                  ? t("missions.daily.card.available", "Available")
                  : cooldownDisplay || t("missions.daily.card.calculating", "Calculating...")}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {!meetsDepositRequirement
                ? `${t("missions.daily.card.deposit_min_prefix", "Deposit at least $")}${minDepositRequired.toFixed(0)}${t(
                    "missions.daily.card.deposit_min_mid",
                    " to unlock this mission. Current: $",
                  )}${depositTotal.toFixed(2)}.`
                : status?.nextEligibleAt
                  ? `${t("missions.daily.card.next_eligible", "Next eligible at ")}${new Date(status.nextEligibleAt).toLocaleString()}`
                  : t("missions.daily.card.cadence", "Complete once every 24 hours.")}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800/70 bg-slate-900/70 p-4">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>{t("missions.daily.card.last_reward", "Last reward")}</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">
              ${status?.lastRewardAmount !== undefined && status?.lastRewardAmount !== null ? status.lastRewardAmount.toFixed(2) : "0.00"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {status?.lastClaimedAt
                ? `${t("missions.daily.card.claimed", "Claimed ")}${new Date(status.lastClaimedAt).toLocaleString()}`
                : t("missions.daily.card.no_claims", "No claims yet.")}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800/70 bg-slate-950/60 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">
                {t("missions.daily.preview.title", "Reward preview")}
              </p>
              <p className="text-xs text-slate-400">
                {t("missions.daily.preview.subtitle", "2.5% of your current wallet balance is added instantly.")}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-800/70 bg-slate-900/80 p-3">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>{t("missions.daily.preview.deposit_requirement", "Deposit requirement")}</span>
                <Badge variant={meetsDepositRequirement ? "default" : "destructive"} className="text-[11px]">
                  {meetsDepositRequirement
                    ? t("missions.daily.preview.ready", "Ready")
                    : t("missions.daily.preview.deposit", "Deposit")}
                </Badge>
              </div>
              <p className="mt-2 text-xl font-semibold text-white">
                ${depositTotal.toFixed(2)} / ${minDepositRequired.toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {t("missions.daily.preview.deposit_min_prefix", "Deposit at least ")}
                {minDepositRequired.toFixed(0)}
                {t("missions.daily.preview.deposit_min_suffix", " to start this mission.")}
              </p>
            </div>
            <div className="rounded-lg border border-slate-800/70 bg-slate-900/80 p-3 text-right">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                {t("missions.daily.preview.current_balance", "Current balance")}
              </p>
              <p className="mt-2 text-xl font-semibold text-emerald-200">
                ${status ? status.currentBalance.toFixed(2) : "0.00"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {t("missions.daily.preview.balance_note", "Mission reward is 2.5% of this balance.")}
              </p>
            </div>
          </div>
          <Button
            onClick={() => void handleComplete()}
            disabled={actionDisabled}
            className="mt-4 h-12 w-full bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 hover:brightness-110 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {t("missions.daily.action.processing", "Processing...")}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                {meetsDepositRequirement
                  ? t("missions.daily.action.complete", "Complete Mission")
                  : `${t("missions.daily.action.deposit_prefix", "Deposit $")}${minDepositRequired.toFixed(0)}${t(
                      "missions.daily.action.deposit_suffix",
                      " to start",
                    )}`}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
