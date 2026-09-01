"use client";

import Link from "next/link";
import { ShieldCheckIcon, MailIcon, KeyRoundIcon, ArrowRightIcon, CheckCircle2Icon, HelpCircleIcon } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { SiteHeader } from "@/src/components/site-header";

type Point = {
  point: string;
};

function splitPoint(point: string): { label: string; body: string } {
  const index = point.indexOf(": ");
  if (index === -1) {
    return { label: "Note", body: point };
  }
  return { label: point.slice(0, index), body: point.slice(index + 2) };
}

export default function Home() {
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

  const steps = [
    {
      icon: MailIcon,
      title: "1. Request OTP",
      description: "Enter your email address to receive a secure 6-digit one-time password.",
    },
    {
      icon: KeyRoundIcon,
      title: "2. Enter Code",
      description: "Check your email and enter the 6-digit OTP code you received.",
    },
    {
      icon: ShieldCheckIcon,
      title: "3. Verify",
      description: "Submit the code to verify your OTP.",
    },
  ];

  return (
    <div className="bg-background min-h-screen">
      <section className="relative overflow-hidden">
        <div className="mesh-bg absolute inset-0" />
        <div className="noise-overlay absolute inset-0" />
        <SiteHeader />
        <div className="relative mx-auto max-w-5xl px-4 pt-28 pb-24 sm:px-6 sm:pt-32 sm:pb-28">
          <div className="animate-fade-up mx-auto max-w-2xl text-center">
            <div className="mb-6 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 ring-1 ring-white/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Secure email verification
              </span>
            </div>
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
                <ShieldCheckIcon className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="mb-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl">OTP Security System</h1>
            <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
              A secure one-time password system for email verification. Test the complete OTP flow from sending to verification.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-11 gap-2 bg-white px-6 text-indigo-800 shadow-lg shadow-black/20 hover:bg-white/90">
                <Link href="/otp/send">
                  Send OTP
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="h-11 text-white hover:bg-white/10 hover:text-white">
                <a href="#how-it-works">How it works</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <section id="how-it-works" className="mb-16 scroll-mt-8">
          <div className="mb-8 text-center">
            <p className="text-primary mb-2 text-sm font-medium tracking-wide uppercase">Flow</p>
            <h2 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">How It Works</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <Card key={step.title} className="border-border/80 hover:border-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <CardHeader>
                    <div className="bg-primary/10 mb-3 flex h-11 w-11 items-center justify-center rounded-xl">
                      <Icon className="text-primary h-5 w-5" />
                    </div>
                    <CardTitle>{step.title}</CardTitle>
                    <CardDescription className="leading-relaxed">{step.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </section>

        <Card className="border-primary/15 from-primary/5 to-card mb-6 bg-gradient-to-br via-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheckIcon className="text-primary h-5 w-5" />
              Test Requirements
            </CardTitle>
            <CardDescription>Requirements for a secure OTP system</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 sm:grid-cols-2">
              {testRequirements.map((requirement) => (
                <li className="flex items-start gap-2.5" key={requirement.point}>
                  <CheckCircle2Icon className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                  <span className="text-muted-foreground text-sm leading-relaxed">{requirement.point}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-foreground flex items-center gap-2 text-xl font-semibold tracking-tight">
                <HelpCircleIcon className="text-primary h-5 w-5" />
                About This Project
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">A brief overview of this project, how it works and why it was built this way.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {aboutThisProject.map((about) => {
              const { label, body } = splitPoint(about.point);
              return (
                <Card key={about.point} className="border-border/80 hover:border-primary/20 transition-colors">
                  <CardHeader className="gap-3">
                    <span className="bg-primary/10 text-primary w-fit rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide uppercase">
                      {label}
                    </span>
                    <CardDescription className="text-[13px] leading-relaxed">{body}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </section>
      </div>

      <footer className="border-border/80 border-t">
        <div className="text-muted-foreground mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-4 py-8 text-xs sm:flex-row sm:px-6">
          <p>Entrostat · OTP Security System</p>
          <p>Test project · not indexed by search engines</p>
        </div>
      </footer>
    </div>
  );
}
