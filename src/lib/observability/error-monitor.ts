export function logStructuredError(
  scope: string,
  error: unknown,
  context?: Record<string, string | number | boolean | null | undefined>
) {
  const safeMessage =
    error instanceof Error
      ? error.message.slice(0, 300)
      : typeof error === "string"
        ? error.slice(0, 300)
        : "Unknown error";

  const payload = {
    level: "error",
    service: "elevante",
    scope,
    message: safeMessage,
    ...(context ? { context } : {}),
    timestamp: new Date().toISOString(),
  };

  console.error(JSON.stringify(payload));
}

