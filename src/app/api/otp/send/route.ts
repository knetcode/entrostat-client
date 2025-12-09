import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/src/env.mjs";
import { correlationIdSchema, type NextServerRquestHeaders } from "@/src/types";
import { type paths } from "@/src/types/spec";

export const path = "/api/otp/send";
export const method = "post";

export type OtpSendSuccessResponse =
  paths[typeof path][typeof method]["responses"]["200"]["content"]["application/json"];
export type OtpSendErrorResponse = paths[typeof path][typeof method]["responses"]["400"]["content"]["application/json"];
export type OtpSendInternalServerErrorResponse =
  paths[typeof path][typeof method]["responses"]["500"]["content"]["application/json"];
export type OtpSendRateLimitErrorResponse =
  paths[typeof path][typeof method]["responses"]["429"]["content"]["application/json"];
export type OtpSendBody = paths[typeof path][typeof method]["requestBody"]["content"]["application/json"];

const emailSchema = z.object({
  email: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        return val.trim().toLowerCase();
      }
      return val;
    },
    z.email({ message: "Invalid email format" }).max(255, { message: "Email is too long" })
  ),
});

export type EmailSchema = z.infer<typeof emailSchema>;

export async function POST(request: NextRequest) {
  try {
    // Validations
    const unsafeCorrelationId = request.headers.get("correlationId");
    if (unsafeCorrelationId === null) {
      return NextResponse.json({ message: "Error: Correlation ID is required", success: false }, { status: 400 });
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

    const requestUrl = `${env.BE_SERVER_URL}${path}`;

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
      return NextResponse.json({ success: false, message: "Invalid response from server" }, { status: 500 });
    }
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: false, message: "An unknown error occurred" }, { status: 500 });
  }
}
