"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { AGENCY_CONTACT } from "@/lib/content/public-defaults";
import { contactEnquirySchema, type ContactEnquiryInput } from "@/lib/validations/enquiry";
import { ScrambleText } from "@/components/common/ScrambleText";
import { ServiceAreaDropdown } from "@/components/marketing/ServiceAreaDropdown";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
    setValue,
    control,
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

  const serviceInterestValue = useWatch({ control, name: "serviceInterest" }) ?? "";

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
    <div className="relative z-20 rounded-2xl border border-[#c8e0da] bg-white/92 p-6 shadow-[0_20px_54px_rgba(23,38,79,0.08)] backdrop-blur-md sm:p-8">
      {/* Subtle corner glow inside clipped decorator */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
      >
        <div className="absolute -top-16 -right-16 size-56 rounded-full bg-[radial-gradient(circle,rgba(49,156,120,0.14),transparent_70%)] blur-2xl" />
      </div>

      <div className="relative z-10 space-y-6">
        <div className="space-y-1.5">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-[#17264F]">
            Send a Project Enquiry
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Share your goals, timeline, and service interest. We review every enquiry before issuing
            a tailored quotation.
          </p>
        </div>

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
              <Label htmlFor="name" className="text-[#17264F]">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Your full name"
                className="h-10 rounded-full border-[#cfe0db] bg-white/90 px-4 focus-visible:border-emerald-500/60 focus-visible:ring-emerald-500/20"
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
              />
              {errors.name ? (
                <p className="text-destructive text-xs">{errors.name.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#17264F]">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                className="h-10 rounded-full border-[#cfe0db] bg-white/90 px-4 focus-visible:border-emerald-500/60 focus-visible:ring-emerald-500/20"
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
              <Label htmlFor="phone" className="text-[#17264F]">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                className="h-10 rounded-full border-[#cfe0db] bg-white/90 px-4 focus-visible:border-emerald-500/60 focus-visible:ring-emerald-500/20"
                aria-invalid={Boolean(errors.phone)}
                {...register("phone")}
              />
              {errors.phone ? (
                <p className="text-destructive text-xs">{errors.phone.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="text-[#17264F]">
                Company / Organization
              </Label>
              <Input
                id="company"
                placeholder="Optional"
                className="h-10 rounded-full border-[#cfe0db] bg-white/90 px-4 focus-visible:border-emerald-500/60 focus-visible:ring-emerald-500/20"
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
              <Label htmlFor="serviceInterest" className="text-[#17264F]">
                Service Area
              </Label>
              <input type="hidden" {...register("serviceInterest")} />
              <ServiceAreaDropdown
                id="serviceInterest"
                value={serviceInterestValue}
                onChange={(nextValue) =>
                  setValue("serviceInterest", nextValue, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
              {errors.serviceInterest ? (
                <p className="text-destructive text-xs">{errors.serviceInterest.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" className="text-[#17264F]">
                Subject <span className="text-destructive">*</span>
              </Label>
              <Input
                id="subject"
                placeholder="Project scope or enquiry topic"
                className="h-10 rounded-full border-[#cfe0db] bg-white/90 px-4 focus-visible:border-emerald-500/60 focus-visible:ring-emerald-500/20"
                aria-invalid={Boolean(errors.subject)}
                {...register("subject")}
              />
              {errors.subject ? (
                <p className="text-destructive text-xs">{errors.subject.message}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-[#17264F]">
              Project Summary <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="message"
              rows={5}
              placeholder="Tell us about your objectives, timeline, and what you want ELEVANTE to build or design..."
              className="rounded-2xl border-[#cfe0db] bg-white/90 px-4 py-3 focus-visible:border-emerald-500/60 focus-visible:ring-emerald-500/20"
              aria-invalid={Boolean(errors.message)}
              {...register("message")}
            />
            {errors.message ? (
              <p className="text-destructive text-xs">{errors.message.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col items-start gap-3 pt-1 sm:flex-row sm:items-center sm:gap-4">
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full rounded-full bg-gradient-to-r from-[#22c58b] to-[#1e9c83] px-6 text-white shadow-[0_8px_22px_rgba(34,197,139,0.28)] hover:opacity-95 sm:w-auto"
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
            <p className="text-muted-foreground text-xs">
              No commitment required &bull; Free scope review
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
