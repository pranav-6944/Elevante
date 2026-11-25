import { NextResponse } from "next/server";
import { extractClientIp } from "@/lib/security/ip";
import { submitPublicEnquiry } from "@/lib/services/enquiry.service";
import { AppError, normalizeActionError } from "@/lib/utils/errors";

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

    const clientIp = extractClientIp(request.headers);
    const result = await submitPublicEnquiry({ rawBody: body, clientIp });

    return NextResponse.json({ ok: true, data: result }, { status: 201 });
  } catch (error) {
    const normalized = normalizeActionError(error);
    const status =
      error instanceof AppError
        ? error.statusCode
        : normalized.code === "VALIDATION_ERROR"
          ? 400
          : 500;

    return NextResponse.json({ ok: false, error: normalized }, { status });
  }
}
