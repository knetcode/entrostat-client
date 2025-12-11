import { z } from "zod";

export const correlationIdSchema = z.uuid({ error: "Correlation ID is not a valid UUID" });
export type CorrelationIdString = z.infer<typeof correlationIdSchema>;

export type NextClientRquestHeaders = {
  accept: "application/json";
  "content-type": "application/json";
  "cache-control": "no-store";
  pragma: "no-cache";
  correlationId: CorrelationIdString;
  "X-CSRF-Token": string;
};

export type NextServerRquestHeaders = {
  accept: "application/json";
  "content-type": "application/json";
  "cache-control": "no-store";
  pragma: "no-cache";
  correlationId: CorrelationIdString;
};

export type CorrelationIdObject = {
  correlationId?: CorrelationIdString;
};

export const emailSchema = z.object({
  email: z.email({ message: "Please enter a valid email address" }).max(255, { message: "Email is too long" }).trim(),
});

export type EmailSchema = z.infer<typeof emailSchema>;

export const otpSchema = z.object({
  email: z.email({ message: "Please enter a valid email address" }).max(255, { message: "Email is too long" }).trim(),
  otp: z
    .string({ error: "Please enter your OTP code" })
    .trim()
    .regex(/^\d{6}$/, { error: "Please enter a 6-digit code" }),
});

export type OtpSchema = z.infer<typeof otpSchema>;
