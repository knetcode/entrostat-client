"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2Icon } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";

export default function OtpSuccessPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  useEffect(() => {
    if (!email) return;

    const successData = queryClient.getQueryData<{ email: string; timestamp: number }>(["otp-verify-success", email]);

    if (!successData) {
      router.replace(`/otp/verify?email=${email}`);
    }
  }, [email, queryClient, router]);

  if (!email) {
    return redirect("/otp/send");
  }

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-foreground mb-2 text-3xl font-bold">Verification Successful</h1>
          <p className="text-foreground/60 text-sm">Your OTP has been successfully verified</p>
        </div>
        <Card>
          <CardHeader className="text-center">
            <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <CheckCircle2Icon className="text-primary h-8 w-8" />
            </div>
            <CardTitle>OTP Verified Successfully</CardTitle>
            <CardDescription>
              <p>Your one-time password has been verified.</p>
              <p>Email: {email}</p>
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
    </div>
  );
}
