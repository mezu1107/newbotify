"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WithdrawForm } from "@/components/wallet/withdraw-form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowUpRight, Lock } from "lucide-react"
import { useI18n } from "@/lib/i18n/provider"
import type { WalletContext } from "@/lib/services/wallet"

interface WithdrawPageClientProps {
  context: WalletContext
  withdrawable: number
  mainBalance: number
  earningsBalance: number
}

export function WithdrawPageClient({ context, withdrawable, mainBalance, earningsBalance }: WithdrawPageClientProps) {
  const { t } = useI18n()

  return (
    <div className="flex h-screen bg-background">
      <Sidebar user={context.user} />
      <main className="flex-1 w-full min-w-0 overflow-auto md:ml-64">
        <div className="w-full max-w-none space-y-6 p-6 md:p-6">
          <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t("withdraw.title", "Withdraw Funds")}</h1>
              <p className="text-muted-foreground">
                {t("withdraw.subtitle", "Request payouts to your external wallet and monitor withdrawal limits.")}
              </p>
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-2">
            <Card className="bg-gradient-to-br from-white/70 to-white/40 shadow-lg shadow-primary/5 dark:from-slate-900/50 dark:to-slate-900/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground">
                  {t("withdraw.main_balance", "Main Balance")}
                </CardTitle>
                <ArrowUpRight className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">${mainBalance.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {t("withdraw.main_balance_sub", "Your primary wallet funds.")}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#34d399]/10 via-[#22d3ee]/10 to-[#6366f1]/10 shadow-lg shadow-primary/5 dark:from-emerald-500/10 dark:via-cyan-500/10 dark:to-indigo-500/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground">
                  {t("withdraw.earnings_balance", "Earnings Balance")}
                </CardTitle>
                <ArrowUpRight className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">${earningsBalance.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {t("withdraw.earnings_balance_sub", "Lifetime earnings from bonuses and rewards.")}
                </p>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("withdraw.available", "Available to Withdraw")}
                </CardTitle>
                <ArrowUpRight className="h-4 w-4 text-sky-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-sky-600">${withdrawable.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {t("withdraw.available_sub", "Funds that can be requested immediately.")}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-sm font-medium">
                  {t("withdraw.min_withdraw", "Minimum Withdrawal")}
                </CardTitle>
                <CardDescription>
                  {t("withdraw.min_withdraw_sub", "Requests below this amount will not be processed.")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${context.withdrawConfig.minWithdraw.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("withdraw.pending", "Pending Withdrawals")}
                </CardTitle>
                <Lock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">${context.stats.pendingWithdraw.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {t("withdraw.pending_sub", "Awaiting administrative approval.")}
                </p>
              </CardContent>
            </Card>
          </section>

          <section>
            <Card>
              <CardHeader>
                <CardTitle>{t("withdraw.request.title", "Request Withdrawal")}</CardTitle>
                <CardDescription>
                  {t(
                    "withdraw.request.subtitle",
                    "Submit a withdrawal to one of your saved USDT addresses or provide a new one for review.",
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {withdrawable <= 0 ? (
                  <Alert>
                    <AlertDescription>
                      {t(
                        "withdraw.request.empty",
                        "You do not have withdrawable funds at this time. Grow your balance or await pending approvals.",
                      )}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <WithdrawForm
                    minWithdraw={context.withdrawConfig.minWithdraw}
                    withdrawableBalance={withdrawable}
                    pendingWithdraw={context.stats.pendingWithdraw}
                    walletBalance={context.stats.walletBalance}
                    earningsBalance={earningsBalance}
                  />
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  )
}
