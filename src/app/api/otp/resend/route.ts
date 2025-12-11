import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { serverLogErrorToApi } from "../../error-log/route";
import { env } from "@/src/env.mjs";
import { correlationIdSchema, emailSchema, type NextServerRquestHeaders } from "@/src/types";
import { type paths } from "@/src/types/spec";

export const path = "/api/otp/resend";
export const method = "post";

export type OtpResendSuccessResponse = paths[typeof path][typeof method]["responses"]["200"]["content"]["application/json"];
export type OtpResendErrorResponse = paths[typeof path][typeof method]["responses"]["400"]["content"]["application/json"];
export type OtpResendInternalServerErrorResponse = paths[typeof path][typeof method]["responses"]["500"]["content"]["application/json"];
export type OtpResendBody = paths[typeof path][typeof method]["requestBody"]["content"]["application/json"];

export async function POST(request: NextRequest) {
  const requestUrl = `${env.BE_SERVER_URL}${path}`;

  try {
    const unsafeCorrelationId = request.headers.get("correlationId");
    if (unsafeCorrelationId === null) {
      return NextResponse.json({ message: "Invalid request. Please refresh the page and try again.", success: false }, { status: 400 });
    }

    const correlationId = correlationIdSchema.safeParse(unsafeCorrelationId);
    if (!correlationId.success) {
      return NextResponse.json(z.flattenError(correlationId.error).fieldErrors, { status: 400 });
    }

    const unsafeBody = (await request.json()) as unknown;
    const body = emailSchema.safeParse(unsafeBody);
    if (!body.success) {
      return NextResponse.json(z.flattenError(body.error).fieldErrors, { status: 400 });
    }

    const requestHeaders: NextServerRquestHeaders = {
      accept: "application/json",
      "content-type": "application/json",
      "cache-control": "no-store",
      pragma: "no-cache",
      correlationId: correlationId.data,
    };

    const response = await fetch(requestUrl, {
      method,
      headers: requestHeaders,
      body: JSON.stringify(body.data),
    });

    try {
      const data = (await response.json()) as unknown;
      return NextResponse.json(data, { status: response.status });
    } catch (error) {
      void serverLogErrorToApi({
        error,
        correlationId: correlationId.data,
        email: body.data.email,
        requestPath: path,
        requestMethod: method.toUpperCase(),
        operation: "OTP resend API",
        response,
      });

      return NextResponse.json(
        { success: false, message: "There was an error processing the response. Please try again in a moment." },
        { status: 500 }
      );
    }
  } catch (error) {
    void serverLogErrorToApi({
      error,
      correlationId: crypto.randomUUID(),
      requestPath: path,
      requestMethod: method.toUpperCase(),
      operation: "OTP resend API route",
      backendUrl: requestUrl,
    });

    return NextResponse.json({ success: false, message: "Something went wrong. Please try again in a moment." }, { status: 500 });
  }
}
