"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, UserPlus } from "lucide-react";
import { registerAction } from "@/actions/auth.actions";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      companyName: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: RegisterInput) {
    setServerError(null);
    const res = await registerAction(values);

    if (!res.ok) {
      if (res.error.fieldErrors) {
        for (const [field, messages] of Object.entries(res.error.fieldErrors)) {
          if (field in values && messages[0]) {
            setError(field as keyof RegisterInput, { message: messages[0] });
          }
        }
      }
      setServerError(res.error.message);
      return;
    }

    if (res.data.requiresEmailVerification) {
      router.push(`/verify-email?email=${encodeURIComponent(res.data.email)}`);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card className="border-border/80 bg-card w-full max-w-md shadow-sm">
      <CardHeader className="space-y-1.5">
        <CardTitle className="text-2xl">Create Client Account</CardTitle>
        <CardDescription>
          Submit project briefs, review quotations, and track deliverables securely.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {serverError ? (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>Registration error</AlertTitle>
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="reg-name">Full Name</Label>
            <Input
              id="reg-name"
              placeholder="Your full name"
              autoComplete="name"
              aria-invalid={Boolean(errors.fullName)}
              {...register("fullName")}
            />
            {errors.fullName ? (
              <p className="text-destructive text-xs">{errors.fullName.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-email">Email Address</Label>
            <Input
              id="reg-email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-destructive text-xs">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-company">Company / Organization (Optional)</Label>
            <Input
              id="reg-company"
              placeholder="Optional"
              autoComplete="organization"
              {...register("companyName")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-password">Password</Label>
            <Input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              placeholder="Min 8 chars, letters + numbers"
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
            />
            {errors.password ? (
              <p className="text-destructive text-xs">{errors.password.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-confirm">Confirm Password</Label>
            <Input
              id="reg-confirm"
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
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus className="size-4" aria-hidden="true" />
                <span>Create Account</span>
              </>
            )}
          </Button>

          <p className="text-muted-foreground text-center text-xs">
            Already have an account?{" "}
            <Link href="/login" className="text-foreground font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
