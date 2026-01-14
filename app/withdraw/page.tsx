import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { WithdrawPageClient } from "@/app/withdraw/withdraw-page-client"
import { verifyToken } from "@/lib/auth"
import { fetchWalletContext } from "@/lib/services/wallet"

export const dynamic = "force-dynamic"

export default async function WithdrawPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  if (!token) {
    redirect("/auth/login")
  }

  const session = verifyToken(token)
  if (!session) {
    redirect("/auth/login")
  }

  const context = await fetchWalletContext(session.userId)
  if (!context) {
    redirect("/auth/login")
  }

  const withdrawable = context.withdrawable.amount
  const mainBalance = context.stats.walletBalance
  const earningsBalance = context.stats.earningsBalance ?? context.stats.totalEarning

  return (
    <WithdrawPageClient
      context={context}
      withdrawable={withdrawable}
      mainBalance={mainBalance}
      earningsBalance={earningsBalance}
    />
  )
}
