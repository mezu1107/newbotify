"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { DepositForm } from "@/components/wallet/deposit-form"
import { Wallet } from "lucide-react"
import { useI18n } from "@/lib/i18n/provider"
import type { WalletContext } from "@/lib/services/wallet"
import type { DepositWalletOption } from "@/lib/config/wallet"

interface DepositPageClientProps {
  context: WalletContext
  walletOptions: DepositWalletOption[]
  loadError: string | null
  isActive: boolean
  lifetimeDeposits: number
  threshold: number
  remainingToActivate: number
  walletBalance: number
  pendingWithdraw: number
  minDeposit: number
  l1Percent: string
  l2Percent: string
}

export function DepositPageClient({
  context,
  walletOptions,
  loadError,
  isActive,
  lifetimeDeposits,
  threshold,
  remainingToActivate,
  walletBalance,
  pendingWithdraw,
  minDeposit,
  l1Percent,
  l2Percent,
}: DepositPageClientProps) {
  const { t } = useI18n()

  return (
    <div className="flex h-screen bg-background">
      <Sidebar user={context.user} />

      <main className="flex-1 w-full overflow-auto md:ml-64">
        <div className="space-y-6 p-6">
          {loadError && (
            <Alert variant="destructive">
              <AlertTitle>{t("deposit.alert.partial", "Some data failed to load")}</AlertTitle>
              <AlertDescription>{loadError}</AlertDescription>
            </Alert>
          )}

          <header className="flex flex-col gap-2 md:flex-row md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">{t("deposit.title", "Deposit Funds")}</h1>
              <p className="text-muted-foreground">
                {t("deposit.subtitle", "Transfer USDT to the platform wallets.")}
              </p>
            </div>

            <div className="text-sm">
              <Badge variant={isActive ? "default" : "outline"}>
                {isActive ? t("deposit.status.active", "Active") : t("deposit.status.inactive", "Inactive")}
              </Badge>
              <p className="text-muted-foreground">
                {t("deposit.lifetime", "Lifetime deposits")}: ${lifetimeDeposits.toFixed(2)} / ${threshold.toFixed(2)}
              </p>
              {!isActive && (
                <p className="text-xs text-muted-foreground">
                  {t("deposit.activate_prefix", "Deposit $")}{remainingToActivate.toFixed(2)}{t("deposit.activate_suffix", " more to activate.")}
                </p>
              )}
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex justify-between">
                <CardTitle className="text-sm">{t("deposit.wallet_balance", "Wallet Balance")}</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${walletBalance.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t("deposit.min_deposit", "Minimum Deposit")}</CardTitle>
                <CardDescription>{t("deposit.min_deposit_sub", "Below this amount is rejected")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">${minDeposit.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t("deposit.pending_withdrawals", "Pending Withdrawals")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">${pendingWithdraw.toFixed(2)}</div>
              </CardContent>
            </Card>
          </section>

          <section>
            <Card>
              <CardHeader>
                <CardTitle>{t("deposit.bonus.title", "Bonus & Referral")}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">{t("deposit.bonus.l1", "Father (L1)")}</p>
                  <p className="text-xl font-semibold">{l1Percent}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("deposit.bonus.l2", "Grandfather (L2)")}</p>
                  <p className="text-xl font-semibold">{l2Percent}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("deposit.bonus.other", "Others")}</p>
                  <p className="text-xl font-semibold">{t("deposit.bonus.other_value", "None")}</p>
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <Card>
              <CardHeader>
                <CardTitle>{t("deposit.submit.title", "Submit Deposit")}</CardTitle>
                <CardDescription>
                  {t("deposit.submit.subtitle", "Select wallet, send funds, submit transaction hash.")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {walletOptions.length === 0 ? (
                  <Alert variant="destructive">
                    <AlertDescription>{t("deposit.wallets_missing", "Deposit wallets are not configured.")}</AlertDescription>
                  </Alert>
                ) : (
                  <DepositForm options={walletOptions} minDeposit={minDeposit} />
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  )
}
