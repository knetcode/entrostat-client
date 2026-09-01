import Link from "next/link";
import { ShieldCheckIcon } from "lucide-react";
import { Button } from "@/src/components/ui/button";

export function SiteHeader({ ctaHref = "/otp/send", ctaLabel = "Send OTP" }: { ctaHref?: string; ctaLabel?: string }) {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5 text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20 transition-colors group-hover:bg-white/25">
            <ShieldCheckIcon className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold tracking-tight">Entrostat</span>
        </Link>
        <Button asChild size="sm" className="bg-white/15 text-white ring-1 ring-white/20 hover:bg-white/25">
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      </div>
    </header>
  );
}
