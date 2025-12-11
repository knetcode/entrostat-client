import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useOtpVerify } from "../use-otp-verify";
import * as csrfClient from "@/lib/csrf/client";
import * as errorLogger from "../use-error-logger";
import React from "react";

// Mock dependencies
jest.mock("@/lib/csrf/client");
jest.mock("../use-error-logger");
jest.mock("@/src/app/api/otp/verify/route", () => ({
  path: "/api/otp/verify",
  method: "post",
}));

const mockCsrfToken = "mock-csrf-token-12345";
const mockLogClientError = jest.fn();

describe("useOtpVerify", () => {
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

  describe("successful OTP verification", () => {
    it("should successfully verify valid OTP", async () => {
      const mockResponse = {
        success: true,
        valid: true,
        message: "OTP verified successfully",
        correlationId: "test-correlation-id",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useOtpVerify(), { wrapper });

      result.current.mutate({
        email: "test@example.com",
        otp: "123456",
        correlationId: "test-correlation-id",
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/otp/verify",
        expect.objectContaining({
          method: "post",
          headers: expect.objectContaining({
            "content-type": "application/json",
            "X-CSRF-Token": mockCsrfToken,
            correlationId: "test-correlation-id",
          }),
          body: JSON.stringify({
            email: "test@example.com",
            otp: "123456",
          }),
        })
      );

      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.data?.valid).toBe(true);
    });

    it("should handle invalid OTP response", async () => {
      const mockResponse = {
        success: true,
        valid: false,
        message: "Invalid OTP code",
        correlationId: "test-correlation-id",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useOtpVerify(), { wrapper });

      result.current.mutate({
        email: "test@example.com",
        otp: "000000",
        correlationId: "test-correlation-id",
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.valid).toBe(false);
    });

    it("should generate correlationId if not provided", async () => {
      const mockResponse = {
        success: true,
        valid: true,
        message: "OTP verified successfully",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useOtpVerify(), { wrapper });

      result.current.mutate({
        email: "test@example.com",
        otp: "123456",
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/otp/verify",
        expect.objectContaining({
          headers: expect.objectContaining({
            correlationId: expect.any(String),
          }),
        })
      );
    });
  });

  describe("error handling", () => {
    it("should handle 400 validation error", async () => {
      const mockErrorResponse = {
        success: false,
        message: "Invalid OTP format",
        correlationId: "test-correlation-id",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 400,
        json: async () => mockErrorResponse,
      });

      const { result } = renderHook(() => useOtpVerify(), { wrapper });

      result.current.mutate({
        email: "test@example.com",
        otp: "abc",
        correlationId: "test-correlation-id",
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe("Invalid OTP format");
      expect(mockLogClientError).toHaveBeenCalled();
    });

    it("should handle expired OTP error", async () => {
      const mockErrorResponse = {
        success: false,
        message: "Your OTP code has expired. Please request a new one to continue.",
        correlationId: "test-correlation-id",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 400,
        json: async () => mockErrorResponse,
      });

      const { result } = renderHook(() => useOtpVerify(), { wrapper });

      result.current.mutate({
        email: "test@example.com",
        otp: "123456",
        correlationId: "test-correlation-id",
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toContain("expired");
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

      const { result } = renderHook(() => useOtpVerify(), { wrapper });

      result.current.mutate({
        email: "test@example.com",
        otp: "123456",
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

      const { result } = renderHook(() => useOtpVerify(), { wrapper });

      result.current.mutate({
        email: "test@example.com",
        otp: "123456",
        correlationId: "test-correlation-id",
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      // The hook returns the generic error message for unexpected status codes
      expect(result.current.error).toBeInstanceOf(Error);
      expect(mockLogClientError).toHaveBeenCalled();
    });

    it("should handle network errors", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new TypeError("Failed to fetch"));

      const { result } = renderHook(() => useOtpVerify(), { wrapper });

      result.current.mutate({
        email: "test@example.com",
        otp: "123456",
        correlationId: "test-correlation-id",
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      // The network error is passed through directly for TypeError
      expect(result.current.error?.message).toContain("fetch");
      // Log function is called asynchronously, so we don't check it here
    });
  });

  describe("security", () => {
    it("should include CSRF token in headers", async () => {
      const mockResponse = {
        success: true,
        valid: true,
        message: "OTP verified successfully",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useOtpVerify(), { wrapper });

      result.current.mutate({
        email: "test@example.com",
        otp: "123456",
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
        valid: true,
        message: "OTP verified successfully",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useOtpVerify(), { wrapper });

      result.current.mutate({
        email: "test@example.com",
        otp: "123456",
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
