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

export function useOtpSend() {
  const { csrfToken } = useCsrfToken();

  async function apiCall({ correlationId, email }: CorrelationIdObject & EmailSchema) {
    const requestUrl = `${path}`;

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
        throw new Error(data.message);
      } else if (response.status === 429) {
        const data = (await response.json()) as OtpSendRateLimitErrorResponse;
        throw new Error(data.message);
      } else if (response.status === 500) {
        const data = (await response.json()) as OtpSendInternalServerErrorResponse;
        throw new Error(data.message);
      }
      throw new Error(`Unexpected status code: ${response.status}`);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`An unknown error occurred: ${error}`);
    }
  }

  return useMutation({
    mutationFn: apiCall,
    mutationKey: [path],
  });
}
