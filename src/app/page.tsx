"use client";

import { useRouter } from "next/navigation";
import { ShieldCheckIcon, MailIcon, KeyRoundIcon, ArrowRightIcon, HelpCircleIcon } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";

type Point = {
  point: string;
};

export default function Home() {
  const router = useRouter();

  const testRequirements: Point[] = [
    { point: "6-digit OTP codes that can start with 0" },
    { point: "Rate limiting: Maximum 3 requests per hour" },
    { point: "30-second expiration window" },
    { point: "24-hour OTP uniqueness guarantee" },
    { point: "One-time use only - OTPs cannot be reused" },
  ];

  const aboutThisProject: Point[] = [
    {
      point:
        "Architecture: Built with a BFF (Backend-For-Frontend) pattern — the Next.js server acts as a secure proxy to the Fastify API. This means the Fastify backend is never directly exposed to the public internet, adding an extra layer of protection.",
    },
    {
      point:
        "Contract-Driven Development: OpenAPI spec is auto-generated from the Fastify backend and used to generate TypeScript types for the frontend, ensuring type-safety across the entire stack and catching integration issues at compile time.",
    },
    {
      point:
        "Security - CSRF Protection: Implemented a custom CSRF protection system with HMAC-SHA256 signed tokens, constant-time comparison to prevent timing attacks, configurable TTL, and a grace period for token rotation to prevent race conditions.",
    },
    {
      point:
        "Security - OTP Verification: Uses constant-time string comparison when verifying OTPs to prevent timing attacks — a common vulnerability in authentication systems that's often overlooked.",
    },
    {
      point:
        "Security - Defense in Depth: Configured strict Content Security Policy (CSP), Cross-Origin-Embedder-Policy (COEP), Cross-Origin-Opener-Policy (COOP), and Permissions-Policy headers. OTPs are never returned in API responses.",
    },
    {
      point:
        "Security - Rate Limiting & Uniqueness: Database-backed rate limiting (max 3 requests/hour per email), 24-hour OTP uniqueness guarantee, and automatic invalidation of old OTPs when new ones are generated.",
    },
    {
      point:
        "Testing: Test suites on both backend (Vitest) and frontend (Jest) — including unit tests for hooks, integration tests for API routes, and end-to-end flow tests. Tests use database cleanup utilities to ensure isolation.",
    },
    {
      point:
        "Observability: Every request is tagged with a correlationId that flows through the entire system — from frontend to backend to database. Errors are persisted to an error_logs table with full context, making production debugging much easier.",
    },
    {
      point:
        "Database: Using Drizzle ORM for type-safe database queries with a SQL-like syntax. Schema includes proper indexing on frequently queried columns (email, correlationId, createdAt) for optimal query performance.",
    },
    {
      point:
        "DevOps: Dockerized deployment with standalone Next.js output for smaller image sizes. Makefile included for local Docker testing (I use Colima instead of Docker Desktop). Currently deployed on my personal VPS.",
    },
    {
      point:
        "Package Management: Using pnpm instead of npm — it's faster, saves disk space via hard links, and blocks pre/post-install scripts by default, which is crucial given the recent supply chain attacks in the JS ecosystem.",
    },
    {
      point:
        "UI/UX: Built with shadcn/ui components which provide accessibility out of the box (ARIA attributes, keyboard navigation) without locking you into a specific design system.",
    },
    {
      point:
        "State Management: TanStack Query handles async state with automatic caching, background refetching, and optimistic updates. Query state is also used to implement page guards — preventing users from accessing /verify or /success pages without completing prior steps.",
    },
    {
      point:
        "Environment Validation: Using @t3-oss/env-nextjs with Zod schemas to validate environment variables at build time — no more runtime crashes from missing env vars in production.",
    },
    {
      point:
        "Code Quality: Strict TypeScript config, ESLint with modern flat config, and Prettier for consistent formatting. All enforced across both client and server packages.",
    },
    {
      point:
        "Privacy: Site is configured with robots noindex/nofollow to prevent search engine indexing — this is a test project that shouldn't appear in search results.",
    },
    {
      point:
        "Real Email Delivery: Integrated with Resend for production email delivery — you'll receive actual OTP emails in real-time. For local development, set SKIP_EMAIL=true to log OTPs to console instead.",
    },
    {
      point:
        "ENV VARS: I'll send the .env files needed to run this locally via email. All credentials will be revoked and resources shutdown on 2025/12/20.",
    },
  ];

  return (
    <div className="bg-background min-h-screen">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#667eea] to-[#764ba2] py-24">
        <div className="bg-grid-white/[0.05] absolute inset-0 bg-[size:20px_20px]" />
        <div className="relative container mx-auto px-4">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <ShieldCheckIcon className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">OTP Security System</h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90 sm:text-xl">
              A secure one-time password system for email verification. Test the complete OTP flow from sending to verification.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" onClick={() => router.push("/otp/send")} className="gap-2 bg-white text-purple-700 hover:bg-white/90">
                Send OTP
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="mb-16">
          <div className="mb-16">
            <h2 className="text-foreground mb-8 text-center text-2xl font-semibold">How It Works</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <div className="bg-primary/10 mb-2 flex h-12 w-12 items-center justify-center rounded-lg">
                    <MailIcon className="text-primary h-6 w-6" />
                  </div>
                  <CardTitle>1. Request OTP</CardTitle>
                  <CardDescription>Enter your email address to receive a secure 6-digit one-time password.</CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="bg-primary/10 mb-2 flex h-12 w-12 items-center justify-center rounded-lg">
                    <KeyRoundIcon className="text-primary h-6 w-6" />
                  </div>
                  <CardTitle>2. Enter Code</CardTitle>
                  <CardDescription>Check your email and enter the 6-digit OTP code you received.</CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="bg-primary/10 mb-2 flex h-12 w-12 items-center justify-center rounded-lg">
                    <ShieldCheckIcon className="text-primary h-6 w-6" />
                  </div>
                  <CardTitle>3. Verify</CardTitle>
                  <CardDescription>Submit the code to verify your OTP.</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>

          <Card className="border-primary/20 bg-primary/5 my-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5" />
                Test Requirements
              </CardTitle>
              <CardDescription>Requirements for a secure OTP system</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-muted-foreground text-sm">
                {testRequirements.map((requirement) => (
                  <li className="flex items-start gap-2" key={requirement.point}>
                    <span className="text-primary">•</span>
                    <span>{requirement.point}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5 my-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircleIcon className="h-5 w-5" />
                About This Project
              </CardTitle>
              <CardDescription>A brief overview of this project, how it works and why it was built this way.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-muted-foreground text-sm">
                {aboutThisProject.map((about) => (
                  <li className="flex items-start gap-2" key={about.point}>
                    <span className="text-primary">•</span>
                    <span>{about.point}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
