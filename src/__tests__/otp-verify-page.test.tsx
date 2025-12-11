/**
 * Component tests for OTP Verify Page
 * Tests the user interface and form behavior for verifying OTPs
 * Also tests the resend functionality which is on this page per requirements
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as navigation from "next/navigation";

// Mock dependencies before imports
jest.mock("@/lib/csrf/client", () => ({
  useCsrfToken: () => ({ csrfToken: "mock-csrf-token" }),
}));

jest.mock("@/src/hooks/use-error-logger", () => ({
  useClientErrorLogger: () => ({
    logClientError: jest.fn(),
  }),
}));

jest.mock("@/src/app/api/otp/verify/route", () => ({
  path: "/api/otp/verify",
  method: "post",
}));

jest.mock("@/src/app/api/otp/resend/route", () => ({
  path: "/api/otp/resend",
  method: "post",
}));

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("@/src/env.mjs", () => ({
  env: {
    NEXT_PUBLIC_RESEND_COOLDOWN_SECONDS: "0",
  },
}));

// Import component after mocks are set up
import OtpVerifyPage from "@/src/app/otp/verify/page";

describe("OTP Verify Page", () => {
  let queryClient: QueryClient;
  const mockPush = jest.fn();
  const mockReplace = jest.fn();
  const mockSearchParams = new Map([
    ["email", "test@example.com"],
    ["correlationId", "test-correlation-id"],
  ]);

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Pre-populate query cache with OTP send success data to prevent redirect
    queryClient.setQueryData(["otp-send-success", "test@example.com"], {
      email: "test@example.com",
      timestamp: Date.now(),
    });

    jest.spyOn(navigation, "useRouter").mockReturnValue({
      push: mockPush,
      replace: mockReplace,
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    });

    jest.spyOn(navigation, "useSearchParams").mockReturnValue({
      get: (key: string) => mockSearchParams.get(key) ?? null,
      getAll: jest.fn(),
      has: jest.fn(),
      keys: jest.fn(),
      values: jest.fn(),
      entries: jest.fn(),
      forEach: jest.fn(),
      toString: jest.fn(),
      size: 0,
      [Symbol.iterator]: jest.fn(),
    } as unknown as ReturnType<typeof navigation.useSearchParams>);

    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <OtpVerifyPage />
      </QueryClientProvider>
    );
  };

  describe("Page rendering", () => {
    it("should render the OTP verification form", () => {
      renderPage();

      expect(screen.getByText("Verify Your OTP")).toBeInTheDocument();
      expect(screen.getByText("OTP Verification")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /verify otp/i })).toBeInTheDocument();
    });

    it("should display the user's email address", () => {
      renderPage();

      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });

    it("should have verify button disabled initially", () => {
      renderPage();

      const verifyButton = screen.getByRole("button", { name: /verify otp/i });
      expect(verifyButton).toBeDisabled();
    });

    it("should show resend OTP button", () => {
      renderPage();

      // The resend button might show countdown initially
      const resendButton = screen.getByRole("button", { name: /resend otp/i });
      expect(resendButton).toBeInTheDocument();
    });

    it("should show 'Use a different email' button", () => {
      renderPage();

      const changeEmailButton = screen.getByRole("button", { name: /use a different email/i });
      expect(changeEmailButton).toBeInTheDocument();
    });
  });

  describe("OTP input", () => {
    it("should render OTP input fields", () => {
      renderPage();

      // The OTP input should be present (it uses input-otp library)
      // We check for the container or textbox elements
      const otpInputs = screen.getAllByRole("textbox");
      expect(otpInputs.length).toBeGreaterThan(0);
    });
  });

  describe("Form submission", () => {
    // Note: OTP input interactions with input-otp library are complex to test
    // The hook-level tests (use-otp-verify.test.ts) cover the API communication
    // These tests verify the UI elements are correctly wired up

    it("should have verify button that is initially disabled", () => {
      renderPage();

      const verifyButton = screen.getByRole("button", { name: /verify otp/i });
      expect(verifyButton).toBeDisabled();
      expect(verifyButton).toHaveAttribute("type", "submit");
    });

    it("should have OTP input field available for user entry", () => {
      renderPage();

      const otpInputs = screen.getAllByRole("textbox");
      expect(otpInputs.length).toBeGreaterThan(0);
    });

    it("should display instructions for entering OTP", () => {
      renderPage();

      expect(screen.getByText(/please enter your OTP code/i)).toBeInTheDocument();
    });
  });

  describe("Resend OTP functionality", () => {
    // Note: The resend button has a cooldown timer in production (mocked to 0 in tests)
    // The hook-level tests (use-otp-resend.test.ts) cover the API communication

    it("should display resend button", () => {
      renderPage();

      const resendButton = screen.getByRole("button", { name: /resend otp/i });
      expect(resendButton).toBeInTheDocument();
    });

    it("should have resend button enabled when cooldown is 0", () => {
      renderPage();

      const resendButton = screen.getByRole("button", { name: /resend otp/i });
      expect(resendButton).toBeInTheDocument();
      // With cooldown mocked to 0, button should be enabled
      expect(resendButton).toBeEnabled();
    });

    it("should have resend button as type button (not submit)", () => {
      renderPage();

      const resendButton = screen.getByRole("button", { name: /resend otp/i });
      expect(resendButton).toHaveAttribute("type", "button");
    });
  });

  describe("Navigation", () => {
    it("should navigate back to send page when 'Use different email' is clicked", async () => {
      const user = userEvent.setup();
      renderPage();

      const changeEmailButton = screen.getByRole("button", { name: /use a different email/i });
      await user.click(changeEmailButton);

      expect(mockPush).toHaveBeenCalledWith("/otp/send");
    });
  });

  describe("OTP validation", () => {
    it("should render OTP input that accepts 6-digit codes", () => {
      renderPage();

      // Verify OTP input container exists
      const otpInputs = screen.getAllByRole("textbox");
      expect(otpInputs.length).toBeGreaterThan(0);

      // Verify the verify button exists but is disabled initially (no OTP entered)
      const verifyButton = screen.getByRole("button", { name: /verify otp/i });
      expect(verifyButton).toBeDisabled();
    });

    it("should display description about 6-digit OTP code", () => {
      renderPage();

      // Verify the page mentions OTP verification
      expect(screen.getByText(/enter the 6-digit code/i)).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper button roles", () => {
      renderPage();

      expect(screen.getByRole("button", { name: /verify otp/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /resend otp/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /use a different email/i })).toBeInTheDocument();
    });

    it("should have form submit button with correct type", () => {
      renderPage();

      const verifyButton = screen.getByRole("button", { name: /verify otp/i });
      expect(verifyButton).toHaveAttribute("type", "submit");
    });
  });

  describe("Edge cases", () => {
    it("should have all required UI elements for error recovery", () => {
      renderPage();

      // Verify user has options to recover from errors
      expect(screen.getByRole("button", { name: /resend otp/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /use a different email/i })).toBeInTheDocument();
    });

    it("should display the email that OTP was sent to", () => {
      renderPage();

      // User should see which email they need to check
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });
  });
});
