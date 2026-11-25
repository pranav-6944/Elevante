"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, LogIn } from "lucide-react";
import { loginAction } from "@/actions/auth.actions";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const URL_ERROR_MESSAGES: Record<string, string> = {
  auth_callback_failed: "Your authentication session could not be verified. Please sign in again.",
  verification_failed: "This verification or recovery link has expired or is invalid.",
  invalid_auth_link: "Invalid authentication link.",
  supabase_not_configured: "Authentication requires Supabase keys in .env.local.",
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const urlError = searchParams.get("error");
  const [serverError, setServerError] = useState<string | null>(
    urlError ? (URL_ERROR_MESSAGES[urlError] ?? "Authentication failed. Please try again.") : null
  );

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setServerError(null);
    const res = await loginAction(values, nextParam);

    if (!res.ok) {
      if (res.error.fieldErrors) {
        for (const [field, messages] of Object.entries(res.error.fieldErrors)) {
          if ((field === "email" || field === "password") && messages[0]) {
            setError(field, { message: messages[0] });
          }
        }
      }
      setServerError(res.error.message);
      return;
    }

    router.push(res.data.redirectTo);
    router.refresh();
  }

  return (
    <Card className="border-border/80 bg-card w-full max-w-md shadow-sm">
      <CardHeader className="space-y-1.5">
        <CardTitle className="text-2xl">Sign In to ELEVANTE</CardTitle>
        <CardDescription>
          Access your Customer Portal or Agency Operations Dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {serverError ? (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>Sign-in issue</AlertTitle>
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="login-email">Email Address</Label>
            <Input
              id="login-email"
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

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="login-password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-secondary text-xs font-medium hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
            />
            {errors.password ? (
              <p className="text-destructive text-xs">{errors.password.message}</p>
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
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <LogIn className="size-4" aria-hidden="true" />
                <span>Sign In</span>
              </>
            )}
          </Button>

          <p className="text-muted-foreground text-center text-xs">
            New to ELEVANTE?{" "}
            <Link href="/register" className="text-foreground font-semibold hover:underline">
              Create a client account
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
