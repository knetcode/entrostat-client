import type { ReactNode } from "react";
import { SiteHeader } from "@/src/components/site-header";
import { StepIndicator } from "@/src/components/step-indicator";

export function AuthShell({ children, step }: { children: ReactNode; step?: 1 | 2 | 3 }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="mesh-bg absolute inset-0" />
      <div className="noise-overlay absolute inset-0" />
      <SiteHeader ctaHref="/" ctaLabel="Home" />
      <main className="relative flex flex-1 flex-col items-center justify-center px-4 py-24">
        {step ? <StepIndicator current={step} /> : null}
        {children}
      </main>
    </div>
  );
}
