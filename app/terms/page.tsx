"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Suspense } from "react"
import { useI18n } from "@/lib/i18n/provider"

const FAQ_ORDER = [
  "terms.faq.1",
  "terms.faq.2",
  "terms.faq.3",
  "terms.faq.4",
  "terms.faq.5",
  "terms.faq.6",
  "terms.faq.7",
  "terms.faq.8",
  "terms.faq.9",
  "terms.faq.10",
  "terms.faq.11",
  "terms.faq.12",
  "terms.faq.13",
]

function TermsContent() {
  const { t } = useI18n()

  const faqItems = FAQ_ORDER.map((key) => ({
    title: t(`${key}.title`, key),
    body: key,
  }))

  return (
    <div className="flex min-h-screen bg-background">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
        <header className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-emerald-500">
            {t("terms.header.kicker", "Knowledge base")}
          </p>
          <h1 className="text-3xl font-semibold">{t("terms.header.title", "Terms & FAQs")}</h1>
          <p className="text-sm text-muted-foreground">
            {t(
              "terms.header.subtitle",
              "Learn how rewards, deposits, withdrawals, and referrals work across the 5gBotify platform.",
            )}
          </p>
        </header>

        <div className="grid gap-4">
          {faqItems.map((faq) => (
            <Card key={faq.title} className="border-slate-200 bg-card shadow-sm dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-base font-semibold">{faq.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {faq.body === "terms.faq.12" ? (
                  <div className="space-y-2">
                    <p className="text-foreground">{t("terms.faq.12.lead", "Need help or facing an issue?")}</p>
                    <p>
                      {t("terms.faq.12.body_a", "If you encounter any issues, contact the")}{" "}
                      <b className="text-foreground">{t("terms.faq.12.support_team", "5gBotify support team")}</b>{" "}
                      {t("terms.faq.12.body_b", "through the")}{" "}
                      <b className="text-foreground">{t("terms.faq.12.help", "Help")}</b>{" "}
                      {t("terms.faq.12.body_c", "or")}{" "}
                      <b className="text-foreground">{t("terms.faq.12.contact", "Contact Us")}</b>{" "}
                      {t("terms.faq.12.body_d", "section in your dashboard for quick assistance.")}
                    </p>
                  </div>
                ) : faq.body === "terms.faq.13" ? (
                  <div className="space-y-3">
                    <p className="font-medium text-foreground">
                      {t("terms.faq.13.question", "Q: What happens if someone creates multiple or fake accounts?")}
                    </p>

                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-foreground">
                      <p className="font-semibold text-red-500">{t("terms.faq.13.policy_title", "Strict Action Policy")}</p>
                      <p className="mt-2">
                        {t("terms.faq.13.policy_a", "If any user creates")}{" "}
                        <b>{t("terms.faq.13.policy_b", "multiple accounts")}</b>{" "}
                        {t("terms.faq.13.policy_c", "or uses")}{" "}
                        <b>{t("terms.faq.13.policy_d", "fake or incorrect information")}</b>,{" "}
                        <b>{t("terms.faq.13.policy_e", "all such accounts will be permanently blocked")}</b>.
                      </p>

                      <ul className="mt-3 list-disc space-y-1 pl-5">
                        <li>{t("terms.faq.13.policy_list_1", "Any deposit made will be forfeited")}</li>
                        <li>{t("terms.faq.13.policy_list_2", "No withdrawals will be allowed")}</li>
                        <li>{t("terms.faq.13.policy_list_3", "Applies regardless of the deposit amount")}</li>
                      </ul>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {t(
                        "terms.faq.13.footer",
                        "Please use only one account and keep your information accurate to avoid issues.",
                      )}
                    </p>
                  </div>
                ) : (
                  t(`${faq.body}.body`, faq.body)
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-card/60 p-6 shadow-sm dark:border-slate-800">
          <h2 className="text-lg font-semibold">{t("terms.help.title", "Need more help?")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t(
              "terms.help.subtitle",
              "Email: support@5gbotify.com - our team is 24/7 available to assist with account, payout, and policy questions.",
            )}
          </p>
        </div>
      </main>
    </div>
  )
}

export default function TermsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      }
    >
      <TermsContent />
    </Suspense>
  )
}
