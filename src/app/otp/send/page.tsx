"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
      await sendOtp.mutateAsync(value, {
        onSuccess: () => {
          queryClient.setQueryData(["otp-send-success", value.email], {
            email: value.email,
            timestamp: Date.now(),
          });
          router.push(`/otp/verify?email=${value.email}`);
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
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-foreground mb-2 text-3xl font-bold">Enter Your Email</h1>
          <p className="text-foreground/60 text-sm">We&apos;ll send you a one-time password to verify your account</p>
        </div>
        <Card>
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
