"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { OTPInput } from "@/components/auth/otp-input"
import { Loader2, Shield, ArrowLeft } from "lucide-react"
import { formatOTPSuccessMessage, type OTPSuccessPayload } from "@/lib/utils/otp-messages"
import { useI18n } from "@/lib/i18n/provider"

export default function VerifyOTPPage() {
  const { t } = useI18n()
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [countdown, setCountdown] = useState(0)

  const router = useRouter()
  const searchParams = useSearchParams()

  const email = searchParams.get("email")
  const phone = searchParams.get("phone")
  const purpose = searchParams.get("purpose") || "registration"
  const contact = email || phone

  // Registration-specific data
  const name = searchParams.get("name")
  const password = searchParams.get("password")
  const referralCode = searchParams.get("referralCode")

  useEffect(() => {
    if (!contact) {
      router.push("/auth/login")
      return
    }
  }, [contact, router])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError(t("auth.verify.error.otp_required", "Please enter the complete 6-digit code"))
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // First verify the OTP
      const verifyResponse = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: otp,
          email: email || undefined,
          phone: phone || undefined,
          purpose,
        }),
      })

      const verifyData = await verifyResponse.json()

      if (!verifyResponse.ok) {
        setError(verifyData.message || verifyData.error || t("auth.verify.error.verify_failed", "Verification failed"))
        return
      }

      // If this is registration, complete the registration process
      if (purpose === "registration" && name && password && referralCode) {
        const registerResponse = await fetch("/api/auth/register-with-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            password,
            referralCode,
            email: email || undefined,
            phone: phone || undefined,
            otpCode: otp,
          }),
        })

        const registerData = await registerResponse.json()

        if (registerResponse.ok) {
          setSuccess(t("auth.verify.success.register", "Registration successful! Redirecting to dashboard..."))
          setTimeout(() => router.push("/dashboard"), 1500)
        } else {
          setError(registerData.message || registerData.error || t("auth.verify.error.register_failed", "Registration failed"))
        }
      } else if (purpose === "login") {
        const loginResponse = await fetch("/api/auth/login-with-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email || undefined,
            phone: phone || undefined,
            otpCode: otp,
          }),
        })

        const loginData = await loginResponse.json()

        if (loginResponse.ok) {
          setSuccess(t("auth.verify.success.login", "Login successful! Redirecting to dashboard..."))
          setTimeout(() => router.push("/dashboard"), 1500)
        } else {
          setError(loginData.message || loginData.error || t("auth.verify.error.login_failed", "Login failed"))
        }
      } else {
        // Handle password reset
        setSuccess(t("auth.verify.success.generic", "Verification successful! Redirecting..."))
        setTimeout(() => {
          router.push("/auth/reset-password?verified=true")
        }, 1500)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : t("auth.verify.error.network", "Network error. Please try again.")
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setIsResending(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email || undefined,
          phone: phone || undefined,
          purpose,
        }),
      })

      const data = (await response.json().catch(() => ({}))) as OTPSuccessPayload & { error?: string; message?: string }

      if (response.ok) {
        setSuccess(formatOTPSuccessMessage(data, t("auth.verify.success.resend", "New verification code sent!")))
        setCountdown(60)
        setOtp("")
      } else {
        setError(data.message || data.error || t("auth.verify.error.resend_failed", "Failed to resend code"))
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : t("auth.verify.error.network", "Network error. Please try again.")
      setError(message)
    } finally {
      setIsResending(false)
    }
  }

  if (!contact) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {purpose === "registration"
              ? t("auth.verify.title.register", "Complete Registration")
              : purpose === "login"
                ? t("auth.verify.title.login", "Complete Login")
                : t("auth.verify.title.default", "Verify Your Account")}
          </CardTitle>
          <CardDescription>
            {t("auth.verify.subtitle.prefix", "Enter the 6-digit code sent to ")}
            <span className="font-medium text-foreground">{email ? email : phone}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <OTPInput value={otp} onChange={setOtp} disabled={isLoading} className="justify-center" />

            <Button onClick={handleVerifyOTP} className="w-full" disabled={isLoading || otp.length !== 6}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {purpose === "registration"
                    ? t("auth.verify.submitting.register", "Creating Account...")
                    : purpose === "login"
                      ? t("auth.verify.submitting.login", "Signing In...")
                      : t("auth.verify.submitting.verifying", "Verifying...")}
                </>
              ) : purpose === "registration" ? (
                t("auth.verify.submit.register", "Create Account")
              ) : purpose === "login" ? (
                t("auth.verify.submit.login", "Sign In")
              ) : (
                t("auth.verify.submit.verify", "Verify Code")
              )}
            </Button>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">{t("auth.verify.resend.prompt", "Didn't receive the code?")}</p>
            <Button
              variant="ghost"
              onClick={handleResendOTP}
              disabled={isResending || countdown > 0}
              className="text-sm"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  {t("auth.verify.resend.sending", "Sending...")}
                </>
              ) : countdown > 0 ? (
                `${t("auth.verify.resend.countdown_prefix", "Resend in ")}${countdown}${t("auth.verify.resend.countdown_suffix", "s")}`
              ) : (
                t("auth.verify.resend.action", "Resend Code")
              )}
            </Button>
          </div>

          <div className="text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-1 h-3 w-3" />
              {t("auth.verify.back", "Back to Login")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
