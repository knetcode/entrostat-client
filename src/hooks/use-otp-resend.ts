import { useMutation } from "@tanstack/react-query";
import type { CorrelationIdObject, EmailSchema, NextClientRquestHeaders } from "@/src/types";
import { useCsrfToken } from "@/lib/csrf/client";
import {
  type OtpResendBody,
  type OtpResendErrorResponse,
  type OtpResendInternalServerErrorResponse,
  type OtpResendSuccessResponse,
  path,
  method,
} from "@/src/app/api/otp/resend/route";
import { useClientErrorLogger } from "@/src/hooks/use-error-logger";

export function useOtpResend() {
  const { csrfToken } = useCsrfToken();

  const { logClientError } = useClientErrorLogger({
    requestPath: path,
    requestMethod: method.toUpperCase(),
    operation: "OTP resend",
  });

  async function apiCall({ correlationId, email }: CorrelationIdObject & EmailSchema) {
    const requestUrl = `${path}`;
    const finalCorrelationId = correlationId ?? crypto.randomUUID();

    const requestHeaders: NextClientRquestHeaders = {
      accept: "application/json",
      "content-type": "application/json",
      "cache-control": "no-store",
      pragma: "no-cache",
      correlationId: finalCorrelationId,
      "X-CSRF-Token": csrfToken,
    };

    const requestBody: OtpResendBody = {
      email,
    };

    try {
      const response = await fetch(requestUrl, {
        method,
        headers: requestHeaders,
        body: JSON.stringify(requestBody),
      });

      if (response.status === 200) {
        const data = (await response.json()) as OtpResendSuccessResponse;
        return data;
      } else if (response.status === 400) {
        const data = (await response.json()) as OtpResendErrorResponse;
        const error = new Error(data.message);

        void logClientError({
          error: response,
          correlationId: data.correlationId || finalCorrelationId,
          email,
          message: data.message,
        });

        throw error;
      } else if (response.status === 500) {
        const data = (await response.json()) as OtpResendInternalServerErrorResponse;
        const error = new Error(data.message);

        void logClientError({
          error: response,
          correlationId: data.correlationId || finalCorrelationId,
          email,
          message: data.message,
        });

        throw error;
      }

      const error = new Error("Something went wrong. Please try again in a moment.");

      void logClientError({
        error: response,
        correlationId: finalCorrelationId,
        email,
      });

      throw error;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message !== "Something went wrong. Please try again in a moment." &&
        !error.message.includes("Unexpected status code")
      ) {
        throw error;
      }

      void logClientError({
        error,
        correlationId: finalCorrelationId,
        email,
        requestUrl,
      });

      if (error instanceof Error) {
        throw error;
      }

      throw new Error("An unexpected error occurred. Please try again.");
    }
  }

  return useMutation({
    mutationFn: apiCall,
    mutationKey: [path],
  });
}
