'use client'

import * as React from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"

type AccessStep = "collect_email" | "enter_otp"

interface EndorsementAccessPanelProps {
  endorsementId: string
}

type SendOtpResponse = { success: true } | { success: false; error: string }
type VerifyOtpResponse = { success: true } | { success: false; error: string }

/**
 * OTP access panel shown on the endorsement view page.
 *
 * Notes:
 * - Until verified, the page shows only public data.
 * - After verification, we refresh the route so the server can render the full editor
 *   (based on the HttpOnly session cookie).
 */
export function EndorsementAccessPanel({
  endorsementId,
}: EndorsementAccessPanelProps): React.JSX.Element {
  const router = useRouter()
  const [step, setStep] = React.useState<AccessStep>("collect_email")

  const [email, setEmail] = React.useState("")
  const [otp, setOtp] = React.useState("")

  const [isSending, setIsSending] = React.useState(false)
  const [isVerifying, setIsVerifying] = React.useState(false)

  async function handleSendOtp(): Promise<void> {
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      toast.error("Please enter your email address.")
      return
    }

    setIsSending(true)
    try {
      const response = await fetch("/api/endorsements/access/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endorsementId,
          email: trimmedEmail,
        }),
      })

      const body = (await response.json()) as SendOtpResponse
      if (!response.ok || body.success === false) {
        toast.error(body.success === false ? body.error : "Unable to send a code. Please try again.")
        return
      }

      toast.success("If the email matches, we’ve sent a verification code.")
      setStep("enter_otp")
      setOtp("")
    } catch {
      toast.error("We couldn’t reach the server. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  async function handleVerifyOtp(): Promise<void> {
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      toast.error("Please enter your email address.")
      return
    }

    if (!/^\d{6}$/.test(otp)) {
      toast.error("Please enter the 6-digit code from your email.")
      return
    }

    setIsVerifying(true)
    try {
      const response = await fetch("/api/endorsements/access/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endorsementId,
          email: trimmedEmail,
          otp,
        }),
      })

      const body = (await response.json()) as VerifyOtpResponse
      if (!response.ok || body.success === false) {
        toast.error(body.success === false ? body.error : "That code didn’t work. Please try again.")
        return
      }

      toast.success("Verified. You can now manage your endorsement.")
      router.refresh()
    } catch {
      toast.error("We couldn’t reach the server. Please try again.")
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <Card className="bg-card/60 supports-[backdrop-filter]:bg-card/40">
      <CardHeader className="space-y-2">
        <CardTitle className="text-lg">Manage your endorsement</CardTitle>
        <p className="text-muted-foreground text-sm leading-relaxed">
          To protect your endorsement from unwanted changes, we’ll send a one-time code to the
          email address you used when submitting. If you didn’t provide an email, please contact
          Craig directly.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="endorsement-access-email">Your email address</Label>
          <Input
            id="endorsement-access-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            disabled={isSending || isVerifying}
          />
        </div>

        {step === "collect_email" ? (
          <Button type="button" onClick={handleSendOtp} disabled={isSending}>
            {isSending ? "Sending..." : "Send verification code"}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Verification code</Label>
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                disabled={isVerifying || isSending}
                aria-label="Enter the 6-digit verification code"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Codes expire after a few minutes. If you don’t see the email, check your spam folder.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" onClick={handleVerifyOtp} disabled={isVerifying}>
                {isVerifying ? "Verifying..." : "Verify and continue"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSendOtp}
                disabled={isSending || isVerifying}
              >
                Resend code
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setStep("collect_email")
                  setOtp("")
                }}
                disabled={isSending || isVerifying}
              >
                Change email
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

