import { createEnv } from "@t3-oss/env-nextjs";
import { z, config } from "zod";

// Disable Zod's JIT compiler which uses `new Function()` - incompatible with strict CSP
config({ jitless: true });

export const env = createEnv({
  server: {
    BE_SERVER_URL: z.url(),
    CSRF_SECRET: z.string(),
    CSRF_ALLOWED_ORIGINS: z.string(),
  },
  client: {
    NEXT_PUBLIC_RESEND_COOLDOWN_SECONDS: z.string(),
  },
  runtimeEnv: {
    BE_SERVER_URL: process.env.BE_SERVER_URL,
    CSRF_SECRET: process.env.CSRF_SECRET,
    CSRF_ALLOWED_ORIGINS: process.env.CSRF_ALLOWED_ORIGINS,
    NEXT_PUBLIC_RESEND_COOLDOWN_SECONDS: process.env.NEXT_PUBLIC_RESEND_COOLDOWN_SECONDS,
  },
});
