import { useCsrfToken } from "@/lib/csrf/client";

type LogErrorOptions = {
  error: unknown | Response | string;
  correlationId: string;
  email?: string;
  requestUrl?: string;
  message?: string;
};

type UseClientErrorLoggerOptions = {
  requestPath: string;
  requestMethod: string;
  operation: string;
};

export function useClientErrorLogger(options: UseClientErrorLoggerOptions) {
  const { csrfToken } = useCsrfToken();
  const { requestPath, requestMethod } = options;

  async function logClientError(opts: LogErrorOptions): Promise<void> {
    const { error, correlationId, email, requestUrl, message } = opts;

    let errorMessage: string;
    let errorType: string;
    let errorStack: string | undefined;

    // Handle Response objects (from API calls)
    if (error instanceof Response) {
      // Set error type based on status
      if (error.status === 400) errorType = "ValidationError";
      else if (error.status === 429) errorType = "RateLimitError";
      else if (error.status === 500) errorType = "ServerError";
      else errorType = "UnexpectedStatusCode";

      // Use provided message or status text
      errorMessage = message || `HTTP ${error.status}${error.statusText ? `: ${error.statusText}` : ""}`;
      errorStack = undefined;
    }
    // Handle Error objects
    else if (error instanceof Error) {
      const isNetworkError = error instanceof TypeError && (error.message.includes("fetch") || error.message.includes("network"));
      errorType = isNetworkError ? "NetworkError" : "UnexpectedError";
      errorMessage = error.message;
      errorStack = error.stack;

      if (isNetworkError && requestUrl) {
        errorMessage += ` | URL: ${requestUrl}`;
      }
    }
    // Handle string messages
    else if (typeof error === "string") {
      errorType = "UnexpectedError";
      errorMessage = error;
      errorStack = new Error(error).stack;
    }
    // Handle everything else
    else {
      errorType = "UnexpectedError";
      errorMessage = "An unexpected error occurred";
      errorStack = undefined;
    }

    // Add email context if provided
    if (email) {
      errorMessage += ` | Email: ${email}`;
    }

    // Send to error logging API
    try {
      await fetch("/api/error-log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
          correlationId,
          email,
          errorMessage,
          errorType,
          errorStack,
          requestPath,
          requestMethod,
        }),
      });
    } catch (err) {
      console.error("[Error Log] Failed to log error:", err);
    }
  }

  return { logClientError };
}
