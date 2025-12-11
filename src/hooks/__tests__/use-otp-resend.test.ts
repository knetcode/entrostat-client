import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useOtpResend } from "../use-otp-resend";
import * as csrfClient from "@/lib/csrf/client";
import * as errorLogger from "../use-error-logger";
import React from "react";

// Mock dependencies
jest.mock("@/lib/csrf/client");
jest.mock("../use-error-logger");
jest.mock("@/src/app/api/otp/resend/route", () => ({
  path: "/api/otp/resend",
  method: "post",
}));

const mockCsrfToken = "mock-csrf-token-12345";
const mockLogClientError = jest.fn();

describe("useOtpResend", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    jest.spyOn(csrfClient, "useCsrfToken").mockReturnValue({
      csrfToken: mockCsrfToken,
    });

    jest.spyOn(errorLogger, "useClientErrorLogger").mockReturnValue({
      logClientError: mockLogClientError,
    });

    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => React.createElement(QueryClientProvider, { client: queryClient }, children);

  describe("successful OTP resend", () => {
    it("should successfully resend OTP", async () => {
      const mockResponse = {
        success: true,
        message: "OTP resent successfully",
        correlationId: "test-correlation-id",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useOtpResend(), { wrapper });

      result.current.mutate({
        email: "test@example.com",
        correlationId: "test-correlation-id",
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/otp/resend",
        expect.objectContaining({
          method: "post",
          headers: expect.objectContaining({
            "content-type": "application/json",
            "X-CSRF-Token": mockCsrfToken,
            correlationId: "test-correlation-id",
          }),
          body: JSON.stringify({ email: "test@example.com" }),
        })
      );

      expect(result.current.data).toEqual(mockResponse);
    });

    it("should generate correlationId if not provided", async () => {
      const mockResponse = {
        success: true,
        message: "OTP resent successfully",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useOtpResend(), { wrapper });

      result.current.mutate({
        email: "test@example.com",
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/otp/resend",
        expect.objectContaining({
          headers: expect.objectContaining({
            correlationId: expect.any(String),
          }),
        })
      );
    });
  });

  describe("error handling", () => {
    it("should handle 400 no OTP to resend error", async () => {
      const mockErrorResponse = {
        success: false,
        message: "No OTP code found for this email. Please request a new one to continue.",
        correlationId: "test-correlation-id",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 400,
        json: async () => mockErrorResponse,
      });

      const { result } = renderHook(() => useOtpResend(), { wrapper });

      result.current.mutate({
        email: "test@example.com",
        correlationId: "test-correlation-id",
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toContain("No OTP code found");
      expect(mockLogClientError).toHaveBeenCalled();
    });

    it("should handle max resend exceeded error", async () => {
      const mockErrorResponse = {
        success: false,
        message: "Maximum resend attempts exceeded. Please request a new OTP.",
        correlationId: "test-correlation-id",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 400,
        json: async () => mockErrorResponse,
      });

      const { result } = renderHook(() => useOtpResend(), { wrapper });

      result.current.mutate({
        email: "test@example.com",
        correlationId: "test-correlation-id",
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toContain("Maximum resend");
      expect(mockLogClientError).toHaveBeenCalled();
    });

    it("should handle 500 internal server error", async () => {
      const mockErrorResponse = {
        success: false,
        message: "Something went wrong. Please try again in a moment.",
        correlationId: "test-correlation-id",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 500,
        json: async () => mockErrorResponse,
      });

      const { result } = renderHook(() => useOtpResend(), { wrapper });

      result.current.mutate({
        email: "test@example.com",
        correlationId: "test-correlation-id",
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe("Something went wrong. Please try again in a moment.");
      expect(mockLogClientError).toHaveBeenCalled();
    });

    it("should handle unexpected status codes", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 503,
        json: async () => ({}),
      });

      const { result } = renderHook(() => useOtpResend(), { wrapper });

      result.current.mutate({
        email: "test@example.com",
        correlationId: "test-correlation-id",
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe("Something went wrong. Please try again in a moment.");
      expect(mockLogClientError).toHaveBeenCalled();
    });

    it("should handle network errors", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new TypeError("Failed to fetch"));

      const { result } = renderHook(() => useOtpResend(), { wrapper });

      result.current.mutate({
        email: "test@example.com",
        correlationId: "test-correlation-id",
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      // The network error is passed through directly for TypeError
      expect(result.current.error?.message).toContain("fetch");
      // Log function is called asynchronously, so we don't check it here
    });
  });

  describe("security and headers", () => {
    it("should include CSRF token in headers", async () => {
      const mockResponse = {
        success: true,
        message: "OTP resent successfully",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useOtpResend(), { wrapper });

      result.current.mutate({
        email: "test@example.com",
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-CSRF-Token": mockCsrfToken,
          }),
        })
      );
    });

    it("should include cache control headers", async () => {
      const mockResponse = {
        success: true,
        message: "OTP resent successfully",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useOtpResend(), { wrapper });

      result.current.mutate({
        email: "test@example.com",
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "cache-control": "no-store",
            pragma: "no-cache",
          }),
        })
      );
    });
  });
});
