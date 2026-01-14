import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { DepositPageClient } from "@/app/deposit/deposit-page-client"
import { verifyToken, type JWTPayload } from "@/lib/auth"
import { fetchWalletContext, type WalletContext } from "@/lib/services/wallet"
import { getDepositWalletOptions, type DepositWalletOption } from "@/lib/config/wallet"
import { ACTIVE_DEPOSIT_THRESHOLD, DEPOSIT_L1_PERCENT, DEPOSIT_L2_PERCENT } from "@/lib/constants/bonuses"

export const dynamic = "force-dynamic"

const pct = (n: number) => `${(n * 100).toFixed(0)}%`

const num = (v: unknown, fallback = 0) => {
  if (v === null || v === undefined) return fallback
  if (typeof v === "number") return v
  const n = Number((v as any).toString?.() ?? v)
  return Number.isFinite(n) ? n : fallback
}

function buildFallbackContext(session: JWTPayload): WalletContext {
  return {
    user: {
      name: session.email,
      email: session.email,
      referralCode: session.userId,
      role: session.role,
      profileAvatar: "avatar-01",
      isActive: false,
      depositTotal: 0,
    },
    stats: {
      currentBalance: 0,
      totalBalance: 0,
      totalEarning: 0,
      earningsBalance: 0,
      pendingWithdraw: 0,
      staked: 0,
      walletBalance: 0,
    },
    minDeposit: 50,
    withdrawConfig: {
      minWithdraw: 30,
    },
    withdrawable: {
      amount: 0,
      pendingWithdraw: 0,
    },
  }
}

export default async function WalletDepositPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) redirect("/auth/login")

  const session = verifyToken(token)
  if (!session) redirect("/auth/login")

  let loadError: { key: string; fallback: string } | null = null
  let context: WalletContext | null = null

  try {
    context = await fetchWalletContext(session.userId)
  } catch (err) {
    console.error("Wallet context error:", err)
    loadError = {
      key: "deposit.error.wallet_context",
      fallback: "We couldn't load your wallet details right now.",
    }
  }

  if (!context) {
    context = buildFallbackContext(session)
  }

  let walletOptions: DepositWalletOption[] = []

  try {
    walletOptions = await getDepositWalletOptions()
  } catch (error) {
    console.error("Wallet options error:", error)
    loadError =
      loadError ?? {
        key: "deposit.error.wallets_missing",
        fallback: "Deposit wallets are not configured.",
      }
  }

  if (walletOptions.length === 0) {
    loadError =
      loadError ?? {
        key: "deposit.error.wallets_missing",
        fallback: "Deposit wallets are not configured.",
      }
  }

  const isActive = !!context.user.isActive
  const lifetimeDeposits = num(context.user.depositTotal)
  const threshold = num(ACTIVE_DEPOSIT_THRESHOLD, 80)
  const remainingToActivate = Math.max(0, threshold - lifetimeDeposits)
  const walletBalance = num(context.stats.walletBalance)
  const pendingWithdraw = num(context.stats.pendingWithdraw)
  const minDeposit = num(context.minDeposit)

  return (
    <DepositPageClient
      context={context}
      walletOptions={walletOptions}
      loadError={loadError}
      isActive={isActive}
      lifetimeDeposits={lifetimeDeposits}
      threshold={threshold}
      remainingToActivate={remainingToActivate}
      walletBalance={walletBalance}
      pendingWithdraw={pendingWithdraw}
      minDeposit={minDeposit}
      l1Percent={pct(DEPOSIT_L1_PERCENT)}
      l2Percent={pct(DEPOSIT_L2_PERCENT)}
    />
  )
}
