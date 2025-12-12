# OTP Client

Next.js frontend for OTP request and verification.

## Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp env.example .env
# Edit .env with your values

# Start development server
pnpm dev
```

## Helpers for running Docker locally

```bash
make build  # Build Docker image
make start  # Start container
```

## Environment Variables

See `env.example` for required variables:

- `BE_SERVER_URL` - Backend API URL
- `CSRF_SECRET` - CSRF token secret (generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`)
- `CSRF_ALLOWED_ORIGINS` - Comma-separated allowed origins
- `NEXT_PUBLIC_RESEND_COOLDOWN_SECONDS` - Resend button cooldown (default: 30)

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run test suite
- `pnpm test:watch` - Run tests in watch mode

## Pages

- `/` - Home page
- `/otp/send` - Request OTP
- `/otp/verify` - Verify OTP
- `/otp/success` - Success confirmation
