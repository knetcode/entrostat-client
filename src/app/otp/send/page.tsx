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
    <div className="relative flex min-h-screen items-center justify-center p-4">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#667eea] to-[#764ba2]" />
      <div className="bg-grid-white/[0.05] absolute inset-0 bg-[size:20px_20px]" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <MailIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-white">Enter Your Email</h1>
          <p className="text-sm text-white/90">We&apos;ll send you a one-time password to verify your account</p>
        </div>
        <Card className="shadow-lg">
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
                  <Button type="submit" disabled={!canSubmit || isSubmitting || !isDirty} className="w-full">
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
    </div>
  );
}
