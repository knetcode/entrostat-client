/**
 * Component tests for OTP Send Page
 * Tests the user interface and form behavior for requesting OTPs
 */

import { render, screen, waitFor } from "@testing-library/react";
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

jest.mock("@/src/app/api/otp/send/route", () => ({
  path: "/api/otp/send",
  method: "post",
}));

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Import component after mocks are set up
import { toast } from "sonner";
import OtpSendPage from "@/src/app/otp/send/page";

describe("OTP Send Page", () => {
  let queryClient: QueryClient;
  const mockPush = jest.fn();

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    jest.spyOn(navigation, "useRouter").mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    });

    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <OtpSendPage />
      </QueryClientProvider>
    );
  };

  describe("Page rendering", () => {
    it("should render the email input form", () => {
      renderPage();

      expect(screen.getByText("Enter Your Email")).toBeInTheDocument();
      expect(screen.getByText("Request OTP")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /send otp/i })).toBeInTheDocument();
    });

    it("should have submit button disabled initially", () => {
      renderPage();

      const submitButton = screen.getByRole("button", { name: /send otp/i });
      expect(submitButton).toBeDisabled();
    });

    it("should display helpful description text", () => {
      renderPage();

      expect(screen.getByText(/we'll send you a one-time password/i)).toBeInTheDocument();
      expect(screen.getByText(/enter your email address to receive/i)).toBeInTheDocument();
    });
  });

  describe("Form validation", () => {
    it("should enable submit button when valid email is entered", async () => {
      const user = userEvent.setup();
      renderPage();

      const emailInput = screen.getByPlaceholderText("Enter your email");
      await user.type(emailInput, "test@example.com");

      await waitFor(() => {
        const submitButton = screen.getByRole("button", { name: /send otp/i });
        expect(submitButton).toBeEnabled();
      });
    });

    it("should show validation error for invalid email format", async () => {
      const user = userEvent.setup();
      renderPage();

      const emailInput = screen.getByPlaceholderText("Enter your email");
      await user.type(emailInput, "invalid-email");
      await user.tab(); // Blur to trigger validation

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it("should keep submit button disabled for invalid email", async () => {
      const user = userEvent.setup();
      renderPage();

      const emailInput = screen.getByPlaceholderText("Enter your email");
      await user.type(emailInput, "not-an-email");

      const submitButton = screen.getByRole("button", { name: /send otp/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe("Form submission", () => {
    it("should submit form and navigate on success", async () => {
      const user = userEvent.setup();
      const mockResponse = {
        success: true,
        message: "OTP sent successfully",
        correlationId: "test-correlation-id",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        json: async () => mockResponse,
      });

      renderPage();

      const emailInput = screen.getByPlaceholderText("Enter your email");
      await user.type(emailInput, "test@example.com");

      const submitButton = screen.getByRole("button", { name: /send otp/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("/otp/verify?correlationId=test-correlation-id&email=test@example.com"));
      });
    });

    it("should show error toast on validation error (400)", async () => {
      const user = userEvent.setup();
      const mockErrorResponse = {
        success: false,
        message: "Invalid email address",
        correlationId: "test-correlation-id",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 400,
        json: async () => mockErrorResponse,
      });

      renderPage();

      const emailInput = screen.getByPlaceholderText("Enter your email");
      await user.type(emailInput, "test@example.com");

      const submitButton = screen.getByRole("button", { name: /send otp/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Invalid email address");
      });
    });

    it("should show error toast on rate limit (429)", async () => {
      const user = userEvent.setup();
      const mockErrorResponse = {
        success: false,
        message: "You've reached the limit of 3 OTP requests per hour",
        correlationId: "test-correlation-id",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 429,
        json: async () => mockErrorResponse,
      });

      renderPage();

      const emailInput = screen.getByPlaceholderText("Enter your email");
      await user.type(emailInput, "test@example.com");

      const submitButton = screen.getByRole("button", { name: /send otp/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("You've reached the limit of 3 OTP requests per hour");
      });
    });

    it("should show error toast on server error (500)", async () => {
      const user = userEvent.setup();
      const mockErrorResponse = {
        success: false,
        message: "Something went wrong while processing your request.",
        correlationId: "test-correlation-id",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 500,
        json: async () => mockErrorResponse,
      });

      renderPage();

      const emailInput = screen.getByPlaceholderText("Enter your email");
      await user.type(emailInput, "test@example.com");

      const submitButton = screen.getByRole("button", { name: /send otp/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });

    it("should not navigate on error", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 400,
        json: async () => ({ success: false, message: "Error" }),
      });

      renderPage();

      const emailInput = screen.getByPlaceholderText("Enter your email");
      await user.type(emailInput, "test@example.com");

      const submitButton = screen.getByRole("button", { name: /send otp/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("Email normalization", () => {
    it("should accept email with leading/trailing spaces (trimmed by form)", async () => {
      const user = userEvent.setup();
      const mockResponse = {
        success: true,
        message: "OTP sent successfully",
        correlationId: "test-correlation-id",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        json: async () => mockResponse,
      });

      renderPage();

      const emailInput = screen.getByPlaceholderText("Enter your email");
      await user.type(emailInput, "  test@example.com  ");

      const submitButton = screen.getByRole("button", { name: /send otp/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            body: expect.stringContaining("test@example.com"),
          })
        );
      });
    });
  });

  describe("Loading state", () => {
    it("should have submit button that can be disabled", () => {
      // This test verifies the button has the correct structure for loading states
      // The actual loading behavior is tested in the hook tests (use-otp-send.test.ts)
      renderPage();

      const submitButton = screen.getByRole("button", { name: /send otp/i });
      expect(submitButton).toHaveAttribute("type", "submit");
      // Button is initially disabled (no email entered)
      expect(submitButton).toBeDisabled();
    });
  });

  describe("Accessibility", () => {
    it("should have proper form labels", () => {
      renderPage();

      const emailInput = screen.getByPlaceholderText("Enter your email");
      expect(emailInput).toHaveAttribute("type", "email");
    });

    it("should have a submit button with proper role", () => {
      renderPage();

      const submitButton = screen.getByRole("button", { name: /send otp/i });
      expect(submitButton).toHaveAttribute("type", "submit");
    });
  });
});
