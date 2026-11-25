"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2, Mail } from "lucide-react";
import { forgotPasswordAction } from "@/actions/auth.actions";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordInput) {
    setStatus(null);
    const res = await forgotPasswordAction(values);

    if (!res.ok) {
      setStatus({ type: "error", message: res.error.message });
      return;
    }

    setStatus({
      type: "success",
      message:
        "If an account exists for that email address, a password recovery link has been sent.",
    });
  }

  return (
    <Card className="border-border/80 bg-card w-full max-w-md shadow-sm">
      <CardHeader className="space-y-1.5">
        <CardTitle className="text-2xl">Reset Your Password</CardTitle>
        <CardDescription>
          Enter your account email address and we will send a secure recovery link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {status ? (
            <Alert variant={status.type === "error" ? "destructive" : "default"}>
              {status.type === "success" ? (
                <CheckCircle2 className="text-brand-green size-4" />
              ) : (
                <AlertCircle className="size-4" />
              )}
              <AlertTitle>
                {status.type === "success" ? "Check your inbox" : "Request error"}
              </AlertTitle>
              <AlertDescription>{status.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="forgot-email">Email Address</Label>
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-destructive text-xs">{errors.email.message}</p>
            ) : null}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-brand-gradient w-full text-white hover:opacity-95"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                <span>Sending Link...</span>
              </>
            ) : (
              <>
                <Mail className="size-4" aria-hidden="true" />
                <span>Send Recovery Link</span>
              </>
            )}
          </Button>

          <p className="text-muted-foreground text-center text-xs">
            Remembered your password?{" "}
            <Link href="/login" className="text-foreground font-semibold hover:underline">
              Return to sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
