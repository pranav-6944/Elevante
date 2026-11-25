"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, MailCheck, AlertCircle } from "lucide-react";
import { resendVerificationAction } from "@/actions/auth.actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function VerifyEmailCard() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") ?? "";
  const [email, setEmail] = useState(initialEmail);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setFeedback(null);
    const res = await resendVerificationAction(email);
    setSending(false);

    if (!res.ok) {
      setFeedback({ type: "error", message: res.error.message });
      return;
    }

    setFeedback({
      type: "success",
      message: "Verification email dispatched. Check your inbox and spam folder.",
    });
  }

  return (
    <Card className="border-border/80 bg-card w-full max-w-md shadow-sm">
      <CardHeader className="space-y-2 text-center">
        <div className="bg-accent text-secondary mx-auto flex size-12 items-center justify-center rounded-2xl">
          <MailCheck className="size-6" aria-hidden="true" />
        </div>
        <CardTitle className="text-2xl">Verify Your Email</CardTitle>
        <CardDescription>
          Click the confirmation link sent to your email address to activate your ELEVANTE account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {feedback ? (
          <Alert variant={feedback.type === "error" ? "destructive" : "default"}>
            {feedback.type === "success" ? (
              <CheckCircle2 className="text-brand-green size-4" />
            ) : (
              <AlertCircle className="size-4" />
            )}
            <AlertTitle>{feedback.type === "success" ? "Email Sent" : "Notice"}</AlertTitle>
            <AlertDescription>{feedback.message}</AlertDescription>
          </Alert>
        ) : null}

        <form onSubmit={handleResend} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="verify-email">Account Email</Label>
            <Input
              id="verify-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
          </div>
          <Button type="submit" variant="outline" disabled={sending} className="w-full">
            {sending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                <span>Resending...</span>
              </>
            ) : (
              <span>Resend Verification Email</span>
            )}
          </Button>
        </form>

        <p className="text-muted-foreground text-center text-xs">
          Already confirmed?{" "}
          <Link href="/login" className="text-foreground font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
