import { type NextRequest, NextResponse } from "next/server";
import { env } from "@/src/env.mjs";
import { type paths } from "@/src/types/spec";

export const path = "/api/error-log";
export const method = "post";

export type ErrorLogBody = paths[typeof path][typeof method]["requestBody"]["content"]["application/json"];

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ErrorLogBody;

    const requestUrl = `${env.BE_SERVER_URL}${path}`;

    const response = await fetch(requestUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    try {
      const data = (await response.json()) as unknown;
      return NextResponse.json(data, { status: response.status });
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "There was an error processing the response. Please try again in a moment." },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: "Something went wrong. Please try again in a moment." }, { status: 500 });
  }
}

type ServerLogErrorOptions = {
  error: unknown;
  correlationId: string;
  email?: string;
  requestPath: string;
  requestMethod: string;
  operation: string;
  backendUrl?: string;
  response?: Response;
};

/**
 * Unified server-side error logging function.
 * Automatically determines error type based on the parameters provided.
 */
export async function serverLogErrorToApi(options: ServerLogErrorOptions): Promise<void> {
  const { error, correlationId, email, requestPath, requestMethod, operation, backendUrl, response } = options;

  let errorMessage: string;
  let errorType: string;
  let errorStack: string | undefined;

  // If response is provided, this is a response parsing error
  if (response) {
    errorType = "ResponseParseError";

    // Try to get response text for debugging
    let responseBodySnippet = "";
    try {
      const responseClone = response.clone();
      const text = await responseClone.text();
      responseBodySnippet = text.length > 200 ? text.substring(0, 200) + "..." : text;
    } catch {
      // Ignore errors when trying to read response body
    }

    errorMessage =
      error instanceof Error
        ? `Failed to parse backend response (status ${response.status}): ${error.message}${responseBodySnippet ? ` | Response body: ${responseBodySnippet}` : ""}`
        : `Failed to parse backend response (status ${response.status})${responseBodySnippet ? ` | Response body: ${responseBodySnippet}` : ""}`;

    errorStack = error instanceof Error ? error.stack : undefined;
  } else {
    // Otherwise, determine error type from the error itself
    const isNetworkError = error instanceof TypeError && error.message.includes("fetch");
    const isJsonParseError = error instanceof SyntaxError;
    errorType = isNetworkError ? "NetworkError" : isJsonParseError ? "RequestParseError" : "UnexpectedError";

    errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    if (isNetworkError) {
      errorMessage = `Network error when calling backend ${operation}: ${errorMessage}${backendUrl ? ` | URL: ${backendUrl}` : ""}`;
    } else if (isJsonParseError) {
      errorMessage = `Failed to parse request body as JSON: ${errorMessage}`;
    } else {
      errorMessage = `Unexpected error in ${operation}: ${errorMessage}`;
    }

    errorStack = error instanceof Error ? error.stack : undefined;
  }

  try {
    await fetch("/api/error-log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
  } catch (error) {
    console.error("[Error Log] Failed to log error to API:", error);
  }
}
