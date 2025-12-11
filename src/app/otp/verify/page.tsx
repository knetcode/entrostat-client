"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { LoaderCircleIcon, KeyRoundIcon } from "lucide-react";
import { otpSchema } from "@/src/types";
import { useOtpVerify } from "@/src/hooks/use-otp-verify";
import { useOtpResend } from "@/src/hooks/use-otp-resend";
import { Button } from "@/src/components/ui/button";
import { Spinner } from "@/src/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { OtpField } from "@/src/components/otp-field";
import { env } from "@/src/env.mjs";

function OtpVerifyContent() {
  const verifyOtp = useOtpVerify();
  const resendOtp = useOtpResend();
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const correlationId = searchParams.get("correlationId");

  const [cooldownSeconds, setCooldownSeconds] = useState(Number(env.NEXT_PUBLIC_RESEND_COOLDOWN_SECONDS));

  useEffect(() => {
    if (!email) return;

    const successData = queryClient.getQueryData<{ email: string; timestamp: number }>(["otp-send-success", email]);

    if (!successData) {
      router.replace("/otp/send");
    }
  }, [email, queryClient, router]);

  const handleResend = useCallback(() => {
    if (!email || cooldownSeconds > 0 || resendOtp.isPending) return;

    resendOtp.mutate(
      { email, correlationId: correlationId! },
      {
        onSuccess: () => {
          queryClient.setQueryData(["otp-send-success", email], {
            email,
            timestamp: Date.now(),
          });
          toast.success("OTP resent successfully! Check your email.");
          setCooldownSeconds(Number(env.NEXT_PUBLIC_RESEND_COOLDOWN_SECONDS));
        },
        onError: (error) => {
          toast.error(error.message);
        },
      }
    );
  }, [email, cooldownSeconds, resendOtp, queryClient, correlationId]);

  const form = useForm({
    defaultValues: {
      email: email!,
      otp: "",
    },
    validators: {
      onChange: otpSchema,
    },
    onSubmit: async ({ formApi, value }) => {
      verifyOtp.mutate(
        { email: value.email, otp: value.otp, correlationId: correlationId! },
        {
          onSuccess: (data) => {
            queryClient.setQueryData(["otp-verify-success", email], {
              email: email!,
              timestamp: Date.now(),
            });
            router.replace(`/otp/success?correlationId=${data.correlationId}&email=${email}`);
            formApi.reset();
          },
          onError: (error) => {
            formApi.setFieldValue("otp", "");
            toast.error(error.message);
          },
        }
      );
    },
  });

  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const timer = setInterval(() => {
      setCooldownSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  if (!email || !correlationId) {
    return redirect("/otp/send");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit();
  }

  const canResend = cooldownSeconds <= 0 && !resendOtp.isPending;

  if (verifyOtp.isPending) {
    return (
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <LoaderCircleIcon className="h-8 w-8 animate-spin text-white" />
            </div>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-white">Verify Your OTP</h1>
          <p className="text-sm text-white/90">
            Enter the 6-digit code sent to <span className="font-medium text-white">{email}</span>
          </p>
        </div>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Verifying OTP...</CardTitle>
            <CardDescription>Please wait while we verify your code</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8">
              <Spinner />
              <p className="text-foreground/60 mt-4 text-sm">Verifying your code...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <KeyRoundIcon className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="mb-2 text-3xl font-bold text-white">Verify Your OTP</h1>
        <p className="text-sm text-white/90">
          Enter the 6-digit code sent to <span className="font-medium text-white">{email}</span>
        </p>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>OTP Verification</CardTitle>
          <CardDescription>Please enter the OTP code you received via email</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
            <form.Field name="otp" children={(field) => <OtpField field={field} otpLength={6} />} />
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting, state.isDirty]}
              children={([canSubmit, isSubmitting, isDirty]) => (
                <div className="flex flex-col gap-3">
                  <Button type="submit" disabled={!canSubmit || isSubmitting || !isDirty} className="w-full">
                    {isSubmitting ? (
                      <>
                        <Spinner />
                        Verifying...
                      </>
                    ) : (
                      "Verify OTP"
                    )}
                  </Button>

                  <Button type="button" variant="outline" onClick={handleResend} disabled={!canResend} className="w-full">
                    {resendOtp.isPending ? (
                      <>
                        <Spinner />
                        Resending...
                      </>
                    ) : cooldownSeconds > 0 ? (
                      `Resend OTP in ${cooldownSeconds}s`
                    ) : (
                      "Resend OTP"
                    )}
                  </Button>

                  <Button type="button" variant="ghost" onClick={() => router.push("/otp/send")} className="w-full">
                    Use a different email
                  </Button>
                </div>
              )}
            />
          </form>
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

export default function OtpVerifyPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-[#667eea] to-[#764ba2]" />
      <div className="bg-grid-white/[0.05] absolute inset-0 bg-[size:20px_20px]" />
      <div className="relative">
        <Suspense fallback={<LoadingFallback />}>
          <OtpVerifyContent />
        </Suspense>
      </div>
    </div>
  );
}
