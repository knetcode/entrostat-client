import { useMutation } from "@tanstack/react-query";
import type { CorrelationIdObject, OtpSchema, NextClientRquestHeaders } from "@/src/types";
import { useCsrfToken } from "@/lib/csrf/client";
import {
  type OtpVerifyBody,
  type OtpVerifyErrorResponse,
  type OtpVerifyInternalServerErrorResponse,
  type OtpVerifySuccessResponse,
  path,
  method,
} from "@/src/app/api/otp/verify/route";
import { useClientErrorLogger } from "@/src/hooks/use-error-logger";

export function useOtpVerify() {
  const { csrfToken } = useCsrfToken();

  const { logClientError } = useClientErrorLogger({
    requestPath: path,
    requestMethod: method.toUpperCase(),
    operation: "OTP verify",
  });

  async function apiCall({ correlationId, email, otp }: CorrelationIdObject & OtpSchema) {
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

    const requestBody: OtpVerifyBody = {
      email,
      otp,
    };

    try {
      const response = await fetch(requestUrl, {
        method,
        headers: requestHeaders,
        body: JSON.stringify(requestBody),
      });

      if (response.status === 200) {
        const data = (await response.json()) as OtpVerifySuccessResponse;
        return data;
      } else if (response.status === 400) {
        const data = (await response.json()) as OtpVerifyErrorResponse;
        const error = new Error(data.message);

        void logClientError({
          error: response,
          correlationId: data.correlationId || finalCorrelationId,
          email,
          message: data.message,
        });

        throw error;
      } else if (response.status === 500) {
        const data = (await response.json()) as OtpVerifyInternalServerErrorResponse;
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
