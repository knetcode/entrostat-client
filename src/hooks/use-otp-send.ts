import { useMutation } from "@tanstack/react-query";
import type { CorrelationIdObject, EmailSchema, NextClientRquestHeaders } from "@/src/types";
import { useCsrfToken } from "@/lib/csrf/client";
import {
  type OtpSendBody,
  type OtpSendErrorResponse,
  type OtpSendInternalServerErrorResponse,
  type OtpSendRateLimitErrorResponse,
  type OtpSendSuccessResponse,
  path,
  method,
} from "@/src/app/api/otp/send/route";
import { useClientErrorLogger } from "@/src/hooks/use-error-logger";

export function useOtpSend() {
  const { csrfToken } = useCsrfToken();

  const { logClientError } = useClientErrorLogger({
    requestPath: path,
    requestMethod: method.toUpperCase(),
    operation: "OTP send",
  });

  async function apiCall({ correlationId, email }: CorrelationIdObject & EmailSchema) {
    const requestUrl = `${path}`;
    const finalCorrelationId = correlationId ?? crypto.randomUUID();

    const requestHeaders: NextClientRquestHeaders = {
      accept: "application/json",
      "content-type": "application/json",
      "cache-control": "no-store",
      pragma: "no-cache",
      correlationId: correlationId ?? crypto.randomUUID(),
      "X-CSRF-Token": csrfToken,
    };

    const requestBody: OtpSendBody = {
      email,
    };

    try {
      const response = await fetch(requestUrl, {
        method,
        headers: requestHeaders,
        body: JSON.stringify(requestBody),
      });

      if (response.status === 200) {
        const data = (await response.json()) as OtpSendSuccessResponse;
        return data;
      } else if (response.status === 400) {
        const data = (await response.json()) as OtpSendErrorResponse;
        const error = new Error(data.message);

        void logClientError({
          error: response,
          correlationId: data.correlationId ?? finalCorrelationId,
          email,
          message: data.message,
        });

        throw error;
      } else if (response.status === 429) {
        const data = (await response.json()) as OtpSendRateLimitErrorResponse;
        const error = new Error(data.message);

        void logClientError({
          error: response,
          correlationId: data.correlationId ?? finalCorrelationId,
          email,
          message: data.message,
        });

        throw error;
      } else if (response.status === 500) {
        const data = (await response.json()) as OtpSendInternalServerErrorResponse;
        const error = new Error(data.message);

        void logClientError({
          error: response,
          correlationId: data.correlationId ?? finalCorrelationId,
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
      if (error instanceof Error && error.message !== "Something went wrong. Please try again in a moment.") {
        throw error;
      }

      void logClientError({
        error,
        correlationId: finalCorrelationId,
        email,
        requestUrl,
      });
      throw new Error("An unexpected error occurred. Please try again.");
    }
  }

  return useMutation({
    mutationFn: apiCall,
    mutationKey: [path],
  });
}
