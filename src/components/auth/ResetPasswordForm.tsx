"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { resetPasswordAction } from "@/actions/auth.actions";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm({ title = "Choose a New Password" }: { title?: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(values: ResetPasswordInput) {
    setStatus(null);
    const res = await resetPasswordAction(values);

    if (!res.ok) {
      setStatus({ type: "error", message: res.error.message });
      return;
    }

    reset();
    setStatus({
      type: "success",
      message: "Your password has been updated securely.",
    });
    router.refresh();
  }

  return (
    <Card className="border-border/80 bg-card w-full max-w-md shadow-sm">
      <CardHeader className="space-y-1.5">
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>Use at least 8 characters including letters and numbers.</CardDescription>
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
                {status.type === "success" ? "Password updated" : "Update failed"}
              </AlertTitle>
              <AlertDescription>{status.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="reset-password">New Password</Label>
            <Input
              id="reset-password"
              type="password"
              autoComplete="new-password"
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
            />
            {errors.password ? (
              <p className="text-destructive text-xs">{errors.password.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reset-confirm">Confirm New Password</Label>
            <Input
              id="reset-confirm"
              type="password"
              autoComplete="new-password"
              aria-invalid={Boolean(errors.confirmPassword)}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword ? (
              <p className="text-destructive text-xs">{errors.confirmPassword.message}</p>
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
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <KeyRound className="size-4" aria-hidden="true" />
                <span>Update Password</span>
              </>
            )}
          </Button>

          <p className="text-muted-foreground text-center text-xs">
            <Link href="/dashboard" className="text-foreground font-semibold hover:underline">
              Continue to Portal
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
