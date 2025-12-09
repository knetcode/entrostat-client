import { type NextRequest, NextResponse } from "next/server";
import { env } from "./env.mjs";
import { createCsrfProtect, handleCsrfInMiddleware } from "@/lib/csrf/server";

const csrfProtect = createCsrfProtect({
  secret: env.CSRF_SECRET,
  allowedOrigins: env.CSRF_ALLOWED_ORIGINS,
});

export const config = {
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};

export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const cspHeader =
    process.env.NODE_ENV === "production"
      ? `
        default-src 'self';
        connect-src 'self';
        script-src 'self' 'nonce-${nonce}';
        style-src 'self' https://fonts.googleapis.com;
        img-src 'self' data:;
        font-src 'self' data: https://fonts.gstatic.com;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        upgrade-insecure-requests;
        `
      : "";

  const contentSecurityPolicyHeaderValue = cspHeader.replace(/\s{2,}/g, " ").trim();
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicyHeaderValue);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  response.headers.set("Content-Security-Policy", contentSecurityPolicyHeaderValue);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Cross-Origin-Embedder-Policy", "require-corp");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Permissions-Policy", "geolocation=(), camera=(), microphone=(), display-capture=()");
  response.headers.set("x-nonce", nonce);

  return await handleCsrfInMiddleware({ csrfProtect, request, response });
}
