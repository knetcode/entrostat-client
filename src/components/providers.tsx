"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { installCsrfResponseInterceptor } from "@/lib/csrf/client";

const ReactQueryDevtools = dynamic(() => import("@tanstack/react-query-devtools").then((m) => m.ReactQueryDevtools), { ssr: false });

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();

  useEffect(() => {
    const cleanup = installCsrfResponseInterceptor();
    return () => {
      cleanup();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
