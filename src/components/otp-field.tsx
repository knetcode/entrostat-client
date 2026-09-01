import { Label } from "@radix-ui/react-label";
import type { AnyFieldApi } from "@tanstack/react-form";
import { FieldError } from "./form-field";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "./ui/input-otp";
import { cn } from "@/lib/utils";

export function OtpField({ field, otpLength }: { field: AnyFieldApi; otpLength: number }) {
  const hasError = field.state.meta.isBlurred && field.state.meta.errors.length > 0;
  const midpoint = Math.ceil(otpLength / 2);

  return (
    <div className="w-full space-y-3">
      <Label htmlFor={field.name} className="text-sm font-medium">
        One-Time Password
      </Label>
      <InputOTP
        maxLength={otpLength}
        value={field.state.value}
        onChange={(value) => field.handleChange(value)}
        onBlur={field.handleBlur}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${field.name}-error` : undefined}
        autoFocus
        containerClassName="justify-center"
      >
        <InputOTPGroup>
          {Array.from({ length: midpoint }).map((_, index) => (
            <InputOTPSlot key={index} index={index} className={cn(hasError && "aria-invalid border-destructive")} />
          ))}
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          {Array.from({ length: otpLength - midpoint }).map((_, index) => (
            <InputOTPSlot key={index + midpoint} index={index + midpoint} className={cn(hasError && "aria-invalid border-destructive")} />
          ))}
        </InputOTPGroup>
      </InputOTP>
      {hasError && <FieldError field={field} />}
    </div>
  );
}
