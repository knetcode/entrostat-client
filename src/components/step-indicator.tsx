import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, label: "Request" },
  { id: 2, label: "Verify" },
  { id: 3, label: "Done" },
] as const;

export function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="mb-10 flex items-center justify-center gap-0" aria-label="Verification progress">
      {steps.map((step, index) => {
        const complete = current > step.id;
        const active = current === step.id;

        return (
          <li key={step.id} className="flex items-center">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  complete && "bg-white text-indigo-700",
                  active && "bg-white text-indigo-700 ring-4 ring-white/25",
                  !complete && !active && "bg-white/15 text-white/70 ring-1 ring-white/20"
                )}
              >
                {complete ? <CheckIcon className="h-3.5 w-3.5" /> : step.id}
              </span>
              <span className={cn("hidden text-sm font-medium sm:inline", active || complete ? "text-white" : "text-white/60")}>{step.label}</span>
            </div>
            {index < steps.length - 1 ? (
              <span className={cn("mx-3 h-px w-8 sm:w-12", complete ? "bg-white/80" : "bg-white/25")} aria-hidden="true" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
