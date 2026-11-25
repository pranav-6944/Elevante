import { ZodError } from "zod";
import type { ActionError, ActionResult, ErrorCode } from "@/types";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode = 400,
    fieldErrors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.fieldErrors = fieldErrors;
  }
}

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function fail(
  code: ErrorCode,
  message: string,
  fieldErrors?: Record<string, string[]>
): ActionResult<never> {
  return {
    ok: false,
    error: { code, message, ...(fieldErrors ? { fieldErrors } : {}) },
  };
}

export function normalizeDatabaseError(
  error: unknown,
  fallback = "Unable to complete database operation."
): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (typeof error === "object" && error !== null && "code" in error) {
    const code = String((error as { code?: unknown }).code ?? "");
    if (code === "23505") {
      return new AppError("CONFLICT", "A record with this identifier already exists.", 409);
    }
    if (code === "23503") {
      return new AppError("VALIDATION_ERROR", "Referenced resource does not exist.", 400);
    }
    if (code === "23514") {
      return new AppError("VALIDATION_ERROR", "Submitted value violates data constraints.", 400);
    }
    if (code === "42501") {
      return new AppError("FORBIDDEN", "You do not have permission for this operation.", 403);
    }
    if (code === "PGRST116") {
      return new AppError("NOT_FOUND", "Requested record was not found.", 404);
    }
  }

  return new AppError("DATABASE_ERROR", fallback, 500);
}

export function normalizeActionError(
  error: unknown,
  fallback = "An unexpected error occurred."
): ActionError {
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
      ...(error.fieldErrors ? { fieldErrors: error.fieldErrors } : {}),
    };
  }

  if (error instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const key = issue.path.join(".") || "_root";
      fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
    }
    return {
      code: "VALIDATION_ERROR",
      message: "Please review the highlighted fields and try again.",
      fieldErrors,
    };
  }

  if (error instanceof Error && error.message.includes("environment variable")) {
    return {
      code: "CONFIGURATION_ERROR",
      message: "Service configuration is incomplete.",
    };
  }

  return {
    code: "INTERNAL_ERROR",
    message: fallback,
  };
}
