import type { AnyFieldApi } from "@tanstack/react-form";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { cn } from "@/lib/utils";

export function FieldError({ field }: { field: AnyFieldApi }) {
  if (!field.state.meta.isBlurred) return null;

  const error = field.state.meta.errors[0]?.message;
  if (!error) return null;

  return (
    <p role="alert" className="text-destructive text-sm font-medium">
      {error}
    </p>
  );
}

export function FormField({ field, type = "text", label, placeholder }: { field: AnyFieldApi; type?: string; label: string; placeholder: string }) {
  const hasError = field.state.meta.isBlurred && field.state.meta.errors.length > 0;

  return (
    <div className="w-full space-y-2">
      <Label htmlFor={field.name}>{label}</Label>
      <Input
        id={field.name}
        name={field.name}
        type={type}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        placeholder={placeholder}
        className={cn(hasError && "aria-invalid")}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${field.name}-error` : undefined}
        autoFocus
      />
      {hasError ? <FieldError field={field} /> : null}
    </div>
  );
}
