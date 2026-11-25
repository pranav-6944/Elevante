"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { AGENCY_CONTACT, CAPABILITIES } from "@/lib/content/public-defaults";
import { contactEnquirySchema, type ContactEnquiryInput } from "@/lib/validations/enquiry";
import { ScrambleText } from "@/components/common/ScrambleText";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ContactApiResponse {
  ok: boolean;
  error?: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
  };
}

export function ContactForm() {
  const [serverFeedback, setServerFeedback] = useState<{
    type: "success" | "notice" | "error";
    title: string;
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactEnquiryInput>({
    resolver: zodResolver(contactEnquirySchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      serviceInterest: "",
      subject: "",
      message: "",
      website: "",
    },
  });

  async function onSubmit(values: ContactEnquiryInput) {
    setServerFeedback(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const payload = (await response.json()) as ContactApiResponse;

      if (payload.ok) {
        reset();
        setServerFeedback({
          type: "success",
          title: "Enquiry received",
          message: `Thank you. Our team typically responds ${AGENCY_CONTACT.responseSla.toLowerCase()}.`,
        });
        return;
      }

      if (payload.error?.fieldErrors) {
        for (const [field, messages] of Object.entries(payload.error.fieldErrors)) {
          if (field in values && messages[0]) {
            setError(field as keyof ContactEnquiryInput, { message: messages[0] });
          }
        }
      }

      setServerFeedback({
        type: payload.error?.code === "CONFIGURATION_ERROR" ? "notice" : "error",
        title:
          payload.error?.code === "CONFIGURATION_ERROR"
            ? "Database & Email Dispatch Pending Phase 3"
            : "Could not submit enquiry",
        message: payload.error?.message ?? "Please review your details and try again.",
      });
    } catch {
      setServerFeedback({
        type: "error",
        title: "Network error",
        message: "Unable to reach the server right now. Please try again shortly.",
      });
    }
  }

  return (
    <Card className="border-border/80 bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Send a Project Enquiry</CardTitle>
        <CardDescription>
          Share your goals, timeline, and service interest. We review every enquiry before issuing a
          tailored quotation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {/* Honeypot field to catch automated bot submissions */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              id="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              {...register("website")}
            />
          </div>

          {serverFeedback ? (
            <Alert variant={serverFeedback.type === "error" ? "destructive" : "default"}>
              {serverFeedback.type === "success" ? (
                <CheckCircle2 className="text-brand-green size-4" />
              ) : (
                <AlertCircle className="size-4" />
              )}
              <AlertTitle>
                <ScrambleText text={serverFeedback.title} trigger="mount" durationMs={400} />
              </AlertTitle>
              <AlertDescription className="space-y-2">
                <p>{serverFeedback.message}</p>
                {serverFeedback.type === "notice" ? (
                  <p>
                    Direct email:{" "}
                    <a
                      href={`mailto:${AGENCY_CONTACT.email}`}
                      className="text-foreground font-medium underline"
                    >
                      {AGENCY_CONTACT.email}
                    </a>
                  </p>
                ) : null}
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Your full name"
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
              />
              {errors.name ? (
                <p className="text-destructive text-xs">{errors.name.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
              />
              {errors.email ? (
                <p className="text-destructive text-xs">{errors.email.message}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                aria-invalid={Boolean(errors.phone)}
                {...register("phone")}
              />
              {errors.phone ? (
                <p className="text-destructive text-xs">{errors.phone.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company / Organization</Label>
              <Input
                id="company"
                placeholder="Optional"
                aria-invalid={Boolean(errors.company)}
                {...register("company")}
              />
              {errors.company ? (
                <p className="text-destructive text-xs">{errors.company.message}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="serviceInterest">Service Area</Label>
              <select
                id="serviceInterest"
                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-full rounded-lg border bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:ring-3 focus-visible:outline-none"
                {...register("serviceInterest")}
              >
                <option value="">Select a capability (optional)</option>
                {CAPABILITIES.map((cap) => (
                  <option key={cap.id} value={cap.title}>
                    {cap.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">
                Subject <span className="text-destructive">*</span>
              </Label>
              <Input
                id="subject"
                placeholder="Project scope or enquiry topic"
                aria-invalid={Boolean(errors.subject)}
                {...register("subject")}
              />
              {errors.subject ? (
                <p className="text-destructive text-xs">{errors.subject.message}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">
              Project Summary <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="message"
              rows={5}
              placeholder="Tell us about your objectives, timeline, and what you want ELEVANTE to build or design..."
              aria-invalid={Boolean(errors.message)}
              {...register("message")}
            />
            {errors.message ? (
              <p className="text-destructive text-xs">{errors.message.message}</p>
            ) : null}
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="bg-brand-gradient w-full text-white hover:opacity-95 sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                <span>Validating Enquiry...</span>
              </>
            ) : (
              <>
                <Send className="size-4" aria-hidden="true" />
                <span>Submit Enquiry</span>
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
