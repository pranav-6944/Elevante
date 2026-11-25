"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react";
import { updateProfileAction } from "@/actions/auth.actions";
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validations/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileSettingsForm({
  email,
  initialValues,
}: {
  email: string;
  initialValues: UpdateProfileInput;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: initialValues,
  });

  async function onSubmit(values: UpdateProfileInput) {
    setStatus(null);
    const res = await updateProfileAction(values);

    if (!res.ok) {
      setStatus({ type: "error", message: res.error.message });
      return;
    }

    setStatus({ type: "success", message: "Profile information updated." });
    router.refresh();
  }

  return (
    <Card className="border-border/80 bg-card shadow-xs">
      <CardHeader>
        <CardTitle className="text-xl">Profile Information</CardTitle>
        <CardDescription>
          Keep your contact details current for project communications.
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
              <AlertTitle>{status.type === "success" ? "Saved" : "Update failed"}</AlertTitle>
              <AlertDescription>{status.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="settings-email">Email Address</Label>
            <Input id="settings-email" type="email" value={email} disabled readOnly />
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-name">Full Name</Label>
            <Input
              id="settings-name"
              aria-invalid={Boolean(errors.fullName)}
              {...register("fullName")}
            />
            {errors.fullName ? (
              <p className="text-destructive text-xs">{errors.fullName.message}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="settings-phone">Phone Number</Label>
              <Input id="settings-phone" {...register("phone")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-company">Company</Label>
              <Input id="settings-company" {...register("companyName")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-job">Role / Job Title</Label>
            <Input id="settings-job" {...register("jobTitle")} />
          </div>

          <Button type="submit" disabled={isSubmitting} className="bg-brand-gradient text-white">
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="size-4" aria-hidden="true" />
                <span>Save Profile</span>
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
