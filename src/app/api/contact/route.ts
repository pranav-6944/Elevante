import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/config/env";
import { contactEnquirySchema } from "@/lib/validations/enquiry";
import { normalizeActionError } from "@/lib/utils/errors";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "VALIDATION_ERROR", message: "Invalid JSON payload." },
        },
        { status: 400 }
      );
    }

    const parsed = contactEnquirySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: normalizeActionError(parsed.error) },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "CONFIGURATION_ERROR",
            message:
              "Your enquiry was validated successfully, but database storage and email delivery will be activated in Phase 3. In the meantime, please email us directly.",
          },
        },
        { status: 503 }
      );
    }

    // Phase 3 wires rate limiting, Supabase `enquiries` insertion, and Resend email dispatch.
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "CONFIGURATION_ERROR",
          message:
            "Enquiry database persistence is scheduled for Phase 3. Please email us directly until Phase 3 is deployed.",
        },
      },
      { status: 503 }
    );
  } catch (error) {
    return NextResponse.json({ ok: false, error: normalizeActionError(error) }, { status: 500 });
  }
}
