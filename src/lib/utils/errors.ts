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
