// @ts-nocheck
"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils/formatting"
import { ensureDate, ensureNumber } from "@/lib/utils/safe-parsing"
import { Trophy, Users, Target } from "lucide-react"
import { useI18n } from "@/lib/i18n/provider"

type OverrideKind = "daily_override" | "team_commission" | "team_reward"

interface OverrideSummary {
  kind: OverrideKind
  pct: number
  payout: "commission" | "reward"
  teams: string[]
}

const overrideKindLabels: Record<OverrideKind, string> = {
  daily_override: "Daily Override",
  team_commission: "Team Commission",
  team_reward: "Team Reward",
}

const overrideKindOrder: OverrideKind[] = [
  "daily_override",
  "team_commission",
  "team_reward",
]

function buildOverrideSummaries(rule: any): OverrideSummary[] {
  if (!rule?.teamOverrides?.length) return []

  const map = new Map<string, OverrideSummary>()
  for (const override of rule.teamOverrides as any[]) {
    if (!override?.pct || !override?.team) continue
    const kind = (override?.kind as OverrideKind | undefined) ??
      ((override?.payout as string) === "reward" ? "team_reward" : "team_commission")
    const key = `${kind}:${override.pct}:${override.payout}`
    const entry = map.get(key) ?? {
      kind,
      pct: override.pct as number,
      payout: override.payout as "commission" | "reward",
      teams: [],
    }

    if (!entry.teams.includes(override.team)) {
      entry.teams.push(override.team as string)
    }

    map.set(key, entry)
  }

  const summaries = Array.from(map.values()).map((summary) => ({
    ...summary,
    teams: summary.teams
      .map((team) => `Team ${team}`)
      .sort((a, b) => a.localeCompare(b)),
  }))

  summaries.sort(
    (a, b) => overrideKindOrder.indexOf(a.kind) - overrideKindOrder.indexOf(b.kind),
  )

  return summaries
}

function displayOverridePct(value: number) {
  if (value === 1) return 4
  return value
}

interface LevelProgressProps {
  currentLevel?: number
  levelProgress?: {
    currentActive?: number
    requiredActive?: number
    progress?: number
    nextLevel?: number
  } | null
  teamStats?: {
    totalMembers?: number
    activeMembers?: number
    directReferrals?: number
    directActive?: number
    totalTeamDeposits?: number
    totalTeamEarnings?: number
  } | null
  currentRule?: any
  nextRule?: any
  directActiveCount?: number
  totalActiveDirects?: number
  lastLevelUpAt?: string | null
  message?: string | null
}

export function LevelProgress({
  currentLevel,
  levelProgress,
  teamStats,
  currentRule,
  nextRule,
  directActiveCount,
  totalActiveDirects,
  lastLevelUpAt,
  message,
}: LevelProgressProps) {
  const { t } = useI18n()
  const safeCurrentLevel = ensureNumber(currentLevel, 0)
  const safeLevelProgress = useMemo(() => {
    if (levelProgress && typeof levelProgress === "object") {
      return {
        currentActive: ensureNumber(levelProgress.currentActive, 0),
        requiredActive: Math.max(ensureNumber(levelProgress.requiredActive, 0), 0),
        progress: Math.min(Math.max(ensureNumber(levelProgress.progress, 0), 0), 100),
        nextLevel: ensureNumber(levelProgress.nextLevel, safeCurrentLevel + 1),
      }
    }

    return null
  }, [levelProgress, safeCurrentLevel])

  const safeTeamStats = useMemo(
    () => ({
      totalMembers: ensureNumber(teamStats?.totalMembers, 0),
      activeMembers: ensureNumber(teamStats?.activeMembers, 0),
      directReferrals: ensureNumber(teamStats?.directReferrals, 0),
      directActive: ensureNumber(teamStats?.directActive, 0),
      totalTeamDeposits: ensureNumber(teamStats?.totalTeamDeposits, 0),
      totalTeamEarnings: ensureNumber(teamStats?.totalTeamEarnings, 0),
    }),
    [teamStats],
  )

  const safeDirectActiveCount = useMemo(() => ensureNumber(directActiveCount, 0), [directActiveCount])
  const safeTotalActiveDirects = useMemo(
    () => ensureNumber(totalActiveDirects, 0),
    [totalActiveDirects],
  )
  const lastLevelUpDate = useMemo(() => ensureDate(lastLevelUpAt), [lastLevelUpAt])
  const safeMessage = useMemo(
    () =>
      typeof message === "string" && message.trim().length > 0
        ? message
        : t("team.levels.message_default", "Keep engaging your team to unlock the next level."),
    [message],
  )

  const currentOverrides = useMemo(() => buildOverrideSummaries(currentRule), [currentRule])
  const nextOverrides = useMemo(() => buildOverrideSummaries(nextRule), [nextRule])
  const currentDirectPct = useMemo(
    () => ensureNumber(currentRule?.directPct, Number.NaN),
    [currentRule],
  )
  const currentTeamRewardPct = useMemo(
    () => ensureNumber(currentRule?.teamRewardPct, Number.NaN),
    [currentRule],
  )
  const nextDirectPct = useMemo(
    () => ensureNumber(nextRule?.directPct, Number.NaN),
    [nextRule],
  )
  const directPctDelta = useMemo(() => {
    if (Number.isFinite(nextDirectPct) && Number.isFinite(currentDirectPct)) {
      return Number.parseFloat((nextDirectPct - currentDirectPct).toFixed(2))
    }

    return null
  }, [currentDirectPct, nextDirectPct])
  const monthlyBonus = useMemo(
    () => ensureNumber(nextRule?.monthlyTargets?.bonus, Number.NaN),
    [nextRule],
  )
  const monthlySalary = useMemo(
    () => ensureNumber(nextRule?.monthlyTargets?.salary, Number.NaN),
    [nextRule],
  )

  const [levelHighlight, setLevelHighlight] = useState(false)
  const [progressHighlight, setProgressHighlight] = useState(false)
  const previousLevelRef = useRef(safeCurrentLevel)
  const previousProgressRef = useRef(safeLevelProgress?.currentActive ?? 0)

  useEffect(() => {
    if (previousLevelRef.current === safeCurrentLevel) {
      return
    }

    previousLevelRef.current = safeCurrentLevel
    setLevelHighlight(true)
    const timeout = window.setTimeout(() => setLevelHighlight(false), 900)
    return () => window.clearTimeout(timeout)
  }, [safeCurrentLevel])

  useEffect(() => {
    const currentActive = safeLevelProgress?.currentActive ?? 0
    if (previousProgressRef.current === currentActive) {
      return
    }

    previousProgressRef.current = currentActive
    setProgressHighlight(true)
    const timeout = window.setTimeout(() => setProgressHighlight(false), 700)
    return () => window.clearTimeout(timeout)
  }, [safeLevelProgress?.currentActive])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Current Level Status */}
      <Card
        className={cn(
          "transition-all duration-500",
          levelHighlight
            ? "ring-2 ring-amber-300/60 shadow-xl shadow-amber-200/30"
            : "ring-1 ring-transparent",
        )}
      >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-600" />
              {t("team.levels.current_title", "Current Level Status")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{t("team.levels.level_label", "Level")} {safeCurrentLevel}</span>
            <Badge variant={safeCurrentLevel > 0 ? "default" : "secondary"} className="text-lg px-3 py-1">
              {safeCurrentLevel === 0 ? t("team.levels.starter", "Starter") : `${t("team.levels.level_label", "Level")} ${safeCurrentLevel}`}
            </Badge>
          </div>

          {currentRule && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("team.levels.direct_commission", "Direct Commission:")}</span>
              <span className="font-medium ">
  8%
</span>

              </div>
              {currentOverrides.map((summary) => (
                <div key={`${summary.kind}-${summary.pct}`} className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t(`team.levels.override.${summary.kind}`, overrideKindLabels[summary.kind])}:
                  </span>
                  <span className="font-medium">
                    {displayOverridePct(summary.pct)}% ({summary.teams.join(", ")})
                  </span>
                </div>
              ))}
            {currentOverrides.length === 0 && Number.isFinite(currentTeamRewardPct) && currentTeamRewardPct > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("team.levels.team_reward", "Team Reward:")}</span>
                  <span className="font-medium">{currentTeamRewardPct}%</span>
                </div>
              )}
            </div>
          )}

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div
              className={cn(
                "rounded-lg border bg-muted/40 p-3 transition-all duration-500",
                progressHighlight
                  ? "border-primary/60 bg-primary/5 shadow-inner shadow-primary/20"
                  : "",
              )}
            >
              <p className="text-muted-foreground">{t("team.levels.direct_active", "Direct active referrals (current cycle)")}</p>
              <p className="text-lg font-semibold">
                {safeDirectActiveCount}
                {safeLevelProgress ? ` / ${safeLevelProgress.requiredActive}` : ""}
              </p>
            </div>
            <div className="rounded-lg border bg-muted/40 p-3">
              <p className="text-muted-foreground">{t("team.levels.total_direct", "Total qualified direct referrals")}</p>
              <p className="text-lg font-semibold">{safeTotalActiveDirects}</p>
            </div>
            <div className="rounded-lg border bg-muted/40 p-3 sm:col-span-2">
              <p className="text-muted-foreground">{t("team.levels.last_level_up", "Last level up")}</p>
              <p className="text-lg font-semibold">
                {lastLevelUpDate ? lastLevelUpDate.toLocaleString() : t("team.levels.no_level_ups", "No level ups yet")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Level Progress */}
      {safeLevelProgress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              {t("team.levels.next_title", "Next Level Progress")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">{t("team.levels.level_label", "Level")} {safeLevelProgress.nextLevel}</span>
              <span className="text-sm text-muted-foreground">
                {safeLevelProgress.currentActive} / {safeLevelProgress.requiredActive} {t("team.levels.active_members", "Active Members")}
              </span>
            </div>

            <Progress value={safeLevelProgress.progress} className="h-3" />

            <div className="text-sm text-center text-muted-foreground">
              {safeLevelProgress.progress >= 100 ? (
                <span className="text-green-600 font-medium">{t("team.levels.requirements_met", "Requirements met! Level will update soon.")}</span>
              ) : (
                <span>
                  {Math.max(safeLevelProgress.requiredActive - safeLevelProgress.currentActive, 0)}{" "}
                  {t("team.levels.members_needed", "more active members needed")}
                </span>
              )}
            </div>

            <Alert variant="secondary" className="text-left">
              <AlertDescription>{safeMessage}</AlertDescription>
            </Alert>

            {nextRule && (
              <div className="space-y-2 text-sm border-t pt-3">
                <h4 className="font-medium">
                  {t("team.levels.benefits_prefix", "Level")} {safeLevelProgress.nextLevel} {t("team.levels.benefits_suffix", "Benefits:")}
                </h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("team.levels.direct_commission", "Direct Commission:")}</span>
                   <span className="font-medium text-green-600">
  8%
</span>

                  </div>
                  {nextOverrides.map((summary) => (
                    <div key={`${summary.kind}-${summary.pct}`} className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t(`team.levels.override.${summary.kind}`, overrideKindLabels[summary.kind])}:
                      </span>
                      <span className="font-medium text-green-600">
                        {displayOverridePct(summary.pct)}% ({summary.teams.join(", ")})
                      </span>
                    </div>
                  ))}
                  {Number.isFinite(monthlyBonus) && monthlyBonus > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("team.levels.monthly_bonus", "Monthly Bonus:")}</span>
                      <span className="font-medium text-green-600">{formatCurrency(monthlyBonus)}</span>
                    </div>
                  )}
                  {Number.isFinite(monthlySalary) && monthlySalary > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("team.levels.monthly_salary", "Monthly Salary:")}</span>
                      <span className="font-medium text-green-600">{formatCurrency(monthlySalary)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Team Statistics */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            {t("team.levels.stats_title", "Team Statistics")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{safeTeamStats.totalMembers}</div>
              <div className="text-sm text-muted-foreground">{t("team.levels.stats.total_members", "Total Members")}</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">{safeTeamStats.activeMembers}</div>
              <div className="text-sm text-muted-foreground">{t("team.levels.stats.active_members", "Active Members")}</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{safeTeamStats.directReferrals}</div>
              <div className="text-sm text-muted-foreground">{t("team.levels.stats.direct_referrals", "Direct Referrals")}</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-amber-600">{formatCurrency(safeTeamStats.totalTeamDeposits)}</div>
              <div className="text-sm text-muted-foreground">{t("team.levels.stats.team_deposits", "Team Deposits")}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
