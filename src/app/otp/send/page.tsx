"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MailIcon } from "lucide-react";
import { emailSchema } from "@/src/types";
import { useOtpSend } from "@/src/hooks/use-otp-send";
import { FormField } from "@/src/components/form-field";
import { Button } from "@/src/components/ui/button";
import { Spinner } from "@/src/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { AuthShell } from "@/src/components/auth-shell";

export default function OtpSendPage() {
  const sendOtp = useOtpSend();
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onChange: emailSchema,
    },
    onSubmit: async ({ formApi, value }) => {
      sendOtp.mutate(value, {
        onSuccess: (data) => {
          queryClient.setQueryData(["otp-send-success", value.email], {
            email: value.email,
            timestamp: Date.now(),
          });
          router.push(`/otp/verify?correlationId=${data.correlationId}&email=${value.email}`);
          formApi.reset();
        },
        onError: (error) => {
          toast.error(error.message);
        },
      });
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit();
  }

  return (
    <AuthShell step={1}>
      <div className="animate-fade-up w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
              <MailIcon className="h-7 w-7 text-white" />
            </div>
          </div>
          <h1 className="mb-2 text-3xl font-semibold tracking-tight text-white">Enter Your Email</h1>
          <p className="text-sm text-white/80">We&apos;ll send you a one-time password to verify your account</p>
        </div>
        <Card className="glass-card border-white/15 bg-white/5 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Request OTP</CardTitle>
            <CardDescription>Enter your email address to receive a one-time password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
              <form.Field
                name="email"
                children={(field) => <FormField label="Email Address" placeholder="Enter your email" type="email" field={field} />}
              />
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting, state.isDirty]}
                children={([canSubmit, isSubmitting, isDirty]) => (
                  <Button type="submit" disabled={!canSubmit || isSubmitting || !isDirty} className="h-11 w-full">
                    {isSubmitting ? (
                      <>
                        <Spinner />
                        Send OTP
                      </>
                    ) : (
                      "Send OTP"
                    )}
                  </Button>
                )}
              />
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthShell>
  );
}
