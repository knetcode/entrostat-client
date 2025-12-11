# Frontend Test Suite

This directory contains unit tests for the Next.js OTP application.

## Test Coverage

### API Route Handlers (`src/app/api/otp/*/__tests__/`)

#### `send/route.test.ts`

Tests the `/api/otp/send` route handler (Next.js API proxy to backend):

- ✅ Successfully proxies OTP send request to backend
- ✅ Forwards 429 rate limit errors from backend
- ✅ Rejects requests without correlationId header
- ✅ Rejects requests with invalid correlationId format
- ✅ Rejects requests with invalid email format
- ✅ Rejects requests with missing email
- ✅ Rejects requests with email that is too long
- ✅ Handles backend 500 errors
- ✅ Handles backend JSON parsing errors
- ✅ Handles fetch network errors
- ✅ Normalizes email (trim and lowercase)

#### `resend/route.test.ts`

Tests the `/api/otp/resend` route handler (Next.js API proxy to backend):

- ✅ Successfully proxies OTP resend request to backend
- ✅ Forwards 400 error when no OTP exists
- ✅ Forwards 400 error when max resends exceeded
- ✅ Rejects requests without correlationId header
- ✅ Rejects requests with invalid correlationId format
- ✅ Rejects requests with invalid email format
- ✅ Rejects requests with missing email
- ✅ Handles backend 500 errors
- ✅ Handles backend JSON parsing errors
- ✅ Handles fetch network errors
- ✅ Includes no-cache headers in backend requests

#### `verify/route.test.ts`

Tests the `/api/otp/verify` route handler (Next.js API proxy to backend):

- ✅ Successfully proxies OTP verify request to backend
- ✅ Handles valid OTP response
- ✅ Forwards invalid OTP response from backend
- ✅ Rejects requests without correlationId header
- ✅ Rejects requests with invalid correlationId format
- ✅ Rejects requests with invalid email format
- ✅ Rejects requests with invalid OTP format (not 6 digits)
- ✅ Rejects requests with non-numeric OTP
- ✅ Rejects requests with missing email
- ✅ Rejects requests with missing OTP
- ✅ Accepts OTP starting with 0
- ✅ Trims whitespace from OTP
- ✅ Handles backend 500 errors
- ✅ Handles backend JSON parsing errors
- ✅ Handles fetch network errors
- ✅ Includes no-cache headers in backend requests

### Page Components (`src/__tests__/`)

#### `otp-send-page.test.tsx`

Tests the OTP Send page component (Requirement 9: email entry screen with send functionality):

- ✅ Renders email input form correctly
- ✅ Submit button disabled when form is empty/invalid
- ✅ Displays helpful description text
- ✅ Enables submit button for valid email
- ✅ Shows validation error for invalid email format
- ✅ Submits form and navigates to verify page on success
- ✅ Shows error toast on validation error (400)
- ✅ Shows error toast on rate limit (429)
- ✅ Shows error toast on server error (500)
- ✅ Does not navigate on error
- ✅ Handles email with whitespace (trim)
- ✅ Shows loading spinner during submission
- ✅ Proper accessibility (form labels, button types)

#### `otp-verify-page.test.tsx`

Tests the OTP Verify page component (Requirement 10: verify screen with email and OTP input, plus resend functionality):

- ✅ Renders OTP verification form correctly
- ✅ Displays user's email address
- ✅ Verify button disabled initially
- ✅ Shows resend OTP button (Requirement 9: resend on same page)
- ✅ Shows "Use different email" navigation button
- ✅ Verifies OTP and navigates to success page
- ✅ Shows error toast for invalid OTP (400)
- ✅ Shows error toast for expired OTP
- ✅ Does not navigate on verification error
- ✅ Successfully resends OTP
- ✅ Shows error when max resends exceeded
- ✅ Shows error when no OTP exists to resend
- ✅ Navigates back to send page for different email
- ✅ Accepts 6-digit OTP codes
- ✅ Accepts OTP starting with 0 (Requirement 1)
- ✅ Handles server errors gracefully
- ✅ Proper accessibility (button roles, form types)

### Custom Hooks (`src/hooks/__tests__/`)

#### `use-otp-send.test.ts`

Tests the OTP send mutation hook:

- ✅ Successfully sends OTP requests
- ✅ Generates correlation IDs automatically
- ✅ Handles 400 validation errors
- ✅ Handles 429 rate limit errors
- ✅ Handles 500 server errors
- ✅ Handles unexpected status codes
- ✅ Handles network errors
- ✅ Includes CSRF token in headers
- ✅ Includes cache control headers

#### `use-otp-verify.test.ts`

Tests the OTP verification mutation hook:

- ✅ Successfully verifies valid OTPs
- ✅ Handles invalid OTP responses
- ✅ Generates correlation IDs automatically
- ✅ Handles 400 validation errors
- ✅ Handles expired OTP errors
- ✅ Handles 500 server errors
- ✅ Handles unexpected status codes
- ✅ Handles network errors
- ✅ Includes CSRF token in headers
- ✅ Includes cache control headers

#### `use-otp-resend.test.ts`

Tests the OTP resend mutation hook:

- ✅ Successfully resends OTPs
- ✅ Generates correlation IDs automatically
- ✅ Handles "no OTP to resend" errors
- ✅ Handles max resend exceeded errors
- ✅ Handles 500 server errors
- ✅ Handles unexpected status codes
- ✅ Handles network errors
- ✅ Includes CSRF token in headers
- ✅ Includes cache control headers

#### `use-error-logger.test.ts`

Tests the client-side error logging utility:

- ✅ Handles 400 validation errors
- ✅ Handles 429 rate limit errors
- ✅ Handles 500 server errors
- ✅ Handles unexpected status codes
- ✅ Handles standard Error objects
- ✅ Handles network TypeError
- ✅ Handles string errors
- ✅ Handles unknown error types
- ✅ Appends email context to error messages
- ✅ Catches and logs when error logging fails
- ✅ Includes CSRF token in requests

## Running Tests

### Run all tests

```bash
pnpm test
```

### Run tests in watch mode

```bash
pnpm test:watch
```

### Run tests with coverage

```bash
pnpm test:coverage
```

### Run specific test file

```bash
pnpm test src/hooks/__tests__/use-otp-send.test.ts
```

## Test Environment

- **Framework**: Jest 30.x
- **Testing Library**: @testing-library/react 16.x
- **Test Environment**: jsdom
- **Mocking**: Built-in Jest mocks

## Test Structure

Each test file follows a consistent structure:

1. **Setup**: Mock dependencies (CSRF client, error logger, API routes)
2. **Describe blocks**: Group related tests by feature
3. **BeforeEach**: Reset mocks and create fresh QueryClient
4. **AfterEach**: Clear all mocks
5. **Tests**: Individual test cases with descriptive names

## Mocked Dependencies

The following are mocked globally:

- `next/navigation` (useRouter, useSearchParams, usePathname)
- `next/server` (NextRequest, NextResponse)
- `@/lib/csrf/client` (useCsrfToken)
- `@/src/hooks/use-error-logger` (useClientErrorLogger)
- API route exports (path, method)

## Test Configuration

See `jest.config.ts` and `jest.setup.ts` for detailed configuration.

Key settings:

- Transform files with Next.js SWC
- Use jsdom environment
- Mock browser APIs (Response, ResizeObserver, crypto)
- Exclude generated files and build artifacts
- Disable watchman for CI compatibility

## Notes

- Component tests cover the main OTP Send and Verify pages
- Hook tests focus on API communication and error handling
- Tests verify both success and error paths
- All HTTP status codes are tested (200, 400, 429, 500, 503)
- Network errors (TypeError) are tested separately
- CSRF protection is verified in all API calls
- OTP input tests verify 6-digit codes including those starting with 0
