import { Label } from "@radix-ui/react-label";
import type { AnyFieldApi } from "@tanstack/react-form";
import { FieldError } from "./form-field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";
import { cn } from "@/lib/utils";

export function OtpField({ field, otpLength }: { field: AnyFieldApi; otpLength: number }) {
  const hasError = field.state.meta.isBlurred && field.state.meta.errors.length > 0;

  return (
    <div className="w-full space-y-2">
      <Label htmlFor={field.name}>One-Time Password</Label>
      <InputOTP
        maxLength={otpLength}
        value={field.state.value}
        onChange={(value) => field.handleChange(value)}
        onBlur={field.handleBlur}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${field.name}-error` : undefined}
        autoFocus
      >
        <InputOTPGroup>
          {Array.from({ length: otpLength }).map((_, index) => (
            <InputOTPSlot key={index} index={index} className={cn(hasError && "aria-invalid border-destructive")} />
          ))}
        </InputOTPGroup>
      </InputOTP>
      {hasError && <FieldError field={field} />}
    </div>
  );
}
