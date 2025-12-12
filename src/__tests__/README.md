# Frontend Test Suite

Jest tests for Next.js OTP application.

## Running Tests

```bash
pnpm test              # Run once
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage
```

## Test Coverage

### API Routes (`src/app/api/otp/*/__tests__/`)

- `send/route.test.ts` - Send OTP proxy route
- `resend/route.test.ts` - Resend OTP proxy route
- `verify/route.test.ts` - Verify OTP proxy route

### Pages (`src/__tests__/`)

- `otp-send-page.test.tsx` - Send OTP page component
- `otp-verify-page.test.tsx` - Verify OTP page component

### Hooks (`src/hooks/__tests__/`)

- `use-otp-send.test.ts` - Send mutation hook
- `use-otp-resend.test.ts` - Resend mutation hook
- `use-otp-verify.test.ts` - Verify mutation hook
- `use-error-logger.test.ts` - Error logging utility

## Test Environment

- Framework: Jest 30.x
- Testing Library: @testing-library/react
- Environment: jsdom

## Mocked Dependencies

- `next/navigation` (router, search params)
- `@/lib/csrf/client` (CSRF tokens)
- `@/src/hooks/use-error-logger` (error logging)
