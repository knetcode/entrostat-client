"use client";

import { Suspense, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2Icon, LoaderCircleIcon } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";

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
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <CheckCircle2Icon className="h-10 w-10 text-white" />
          </div>
        </div>
        <h1 className="mb-2 text-3xl font-bold text-white">Verification Successful</h1>
        <p className="text-sm text-white/90">Your OTP has been successfully verified</p>
      </div>
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CardTitle>OTP Verified Successfully</CardTitle>
          <CardDescription>
            <p>Your one-time password has been verified.</p>
            <p className="text-foreground mt-2 font-medium">Email: {email}</p>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={() => router.replace("/otp/send")} className="w-full">
            Verify Another Email
          </Button>
          <Button onClick={() => router.replace("/")} variant="outline" className="w-full">
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
      <LoaderCircleIcon className="text-primary h-8 w-8 animate-spin" />
    </div>
  );
}

export default function OtpSuccessPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-[#667eea] to-[#764ba2]" />
      <div className="bg-grid-white/[0.05] absolute inset-0 bg-[size:20px_20px]" />
      <div className="relative">
        <Suspense fallback={<LoadingFallback />}>
          <OtpSuccessContent />
        </Suspense>
      </div>
    </div>
  );
}
