"use client";

import { Suspense, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2Icon, LoaderCircleIcon } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { AuthShell } from "@/src/components/auth-shell";

function OtpSuccessContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const correlationId = searchParams.get("correlationId");
  const router = useRouter();

  useEffect(() => {
    if (!email) {
      router.replace("/otp/send");
      return;
    }

    const successData = queryClient.getQueryData<{ email: string; timestamp: number }>(["otp-verify-success", email]);

    if (!successData) {
      router.replace(`/otp/verify?correlationId=${correlationId}&email=${email}`);
      return;
    }
  }, [email, queryClient, correlationId, router]);

  return (
    <div className="animate-fade-up w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/20 ring-1 ring-emerald-200/40 backdrop-blur-sm">
            <CheckCircle2Icon className="h-8 w-8 text-emerald-100" />
          </div>
        </div>
        <h1 className="mb-2 text-3xl font-semibold tracking-tight text-white">Verification Successful</h1>
        <p className="text-sm text-white/80">Your OTP has been successfully verified</p>
      </div>
      <Card className="glass-card">
        <CardHeader className="text-center">
          <CardTitle>OTP Verified Successfully</CardTitle>
          <CardDescription>
            <p>Your one-time password has been verified.</p>
            <p className="text-foreground mt-2 font-medium">Email: {email}</p>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={() => router.replace("/otp/send")} className="h-11 w-full">
            Verify Another Email
          </Button>
          <Button onClick={() => router.replace("/")} variant="outline" className="h-11 w-full">
            Go to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center">
      <LoaderCircleIcon className="h-8 w-8 animate-spin text-white" />
    </div>
  );
}

export default function OtpSuccessPage() {
  return (
    <AuthShell step={3}>
      <Suspense fallback={<LoadingFallback />}>
        <OtpSuccessContent />
      </Suspense>
    </AuthShell>
  );
}
