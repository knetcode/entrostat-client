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
    {
      point: "6-digit OTP codes that can start with 0",
    },
    {
      point: "Rate limiting: Maximum 3 requests per hour",
    },
    {
      point: "30-second expiration window",
    },
    {
      point: "24-hour OTP uniqueness guarantee",
    },
    {
      point: "One-time use only - OTPs cannot be reused",
    },
  ];

  const aboutThisProject: Point[] = [
    {
      point: "Built with a modern tech stack: Fastify backend, Next.js 16 frontend, and PostgreSQL database",
    },
    {
      point: "Implements industry-standard security practices including rate limiting, constant-time OTP comparison, and CSRF protection",
    },
    {
      point: "Features a complete CI/CD pipeline with automated testing and containerized deployment",
    },
    {
      point: "Email delivery powered by Resend for reliable and beautiful OTP emails",
    },
    {
      point: "Clean architecture with separation of concerns: services, routes, and data layers",
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

      {/* Content Section */}
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
