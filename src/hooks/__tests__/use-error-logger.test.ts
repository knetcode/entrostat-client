import { renderHook, waitFor } from "@testing-library/react";
import { useClientErrorLogger } from "../use-error-logger";
import * as csrfClient from "@/lib/csrf/client";

// Mock dependencies
jest.mock("@/lib/csrf/client");

const mockCsrfToken = "mock-csrf-token-12345";

describe("useClientErrorLogger", () => {
  beforeEach(() => {
    jest.spyOn(csrfClient, "useCsrfToken").mockReturnValue({
      csrfToken: mockCsrfToken,
    });

    global.fetch = jest.fn();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const defaultOptions = {
    requestPath: "/api/otp/send",
    requestMethod: "POST",
    operation: "OTP send",
  };

  describe("Response error handling", () => {
    it("should handle 400 validation errors", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({ status: 200 });

      const { result } = renderHook(() => useClientErrorLogger(defaultOptions));

      const mockResponse = new Response(null, {
        status: 400,
        statusText: "Bad Request",
      });

      await result.current.logClientError({
        error: mockResponse,
        correlationId: "test-id",
        email: "test@example.com",
        message: "Invalid email",
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/error-log",
          expect.objectContaining({
            method: "POST",
            headers: expect.objectContaining({
              "Content-Type": "application/json",
              "X-CSRF-Token": mockCsrfToken,
            }),
            body: expect.stringContaining('"errorType":"ValidationError"'),
          })
        );
      });

      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody).toMatchObject({
        correlationId: "test-id",
        email: "test@example.com",
        errorType: "ValidationError",
        requestPath: "/api/otp/send",
        requestMethod: "POST",
      });
      expect(callBody.errorMessage).toContain("Invalid email");
    });

    it("should handle 429 rate limit errors", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({ status: 200 });

      const { result } = renderHook(() => useClientErrorLogger(defaultOptions));

      const mockResponse = new Response(null, {
        status: 429,
        statusText: "Too Many Requests",
      });

      await result.current.logClientError({
        error: mockResponse,
        correlationId: "test-id",
        message: "Rate limit exceeded",
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.errorType).toBe("RateLimitError");
    });

    it("should handle 500 server errors", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({ status: 200 });

      const { result } = renderHook(() => useClientErrorLogger(defaultOptions));

      const mockResponse = new Response(null, {
        status: 500,
        statusText: "Internal Server Error",
      });

      await result.current.logClientError({
        error: mockResponse,
        correlationId: "test-id",
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.errorType).toBe("ServerError");
    });

    it("should handle unexpected status codes", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({ status: 200 });

      const { result } = renderHook(() => useClientErrorLogger(defaultOptions));

      const mockResponse = new Response(null, {
        status: 418,
        statusText: "I'm a teapot",
      });

      await result.current.logClientError({
        error: mockResponse,
        correlationId: "test-id",
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.errorType).toBe("UnexpectedStatusCode");
    });
  });

  describe("Error object handling", () => {
    it("should handle standard Error objects", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({ status: 200 });

      const { result } = renderHook(() => useClientErrorLogger(defaultOptions));

      const error = new Error("Something went wrong");

      await result.current.logClientError({
        error,
        correlationId: "test-id",
        email: "test@example.com",
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody).toMatchObject({
        errorType: "UnexpectedError",
        errorMessage: expect.stringContaining("Something went wrong"),
        errorStack: expect.any(String),
      });
    });

    it("should handle network TypeError", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({ status: 200 });

      const { result } = renderHook(() => useClientErrorLogger(defaultOptions));

      const error = new TypeError("Failed to fetch");

      await result.current.logClientError({
        error,
        correlationId: "test-id",
        requestUrl: "https://example.com/api",
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.errorType).toBe("NetworkError");
      expect(callBody.errorMessage).toContain("https://example.com/api");
    });
  });

  describe("String error handling", () => {
    it("should handle string errors", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({ status: 200 });

      const { result } = renderHook(() => useClientErrorLogger(defaultOptions));

      await result.current.logClientError({
        error: "String error message",
        correlationId: "test-id",
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody).toMatchObject({
        errorType: "UnexpectedError",
        errorMessage: "String error message",
        errorStack: expect.any(String),
      });
    });
  });

  describe("Unknown error handling", () => {
    it("should handle unknown error types", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({ status: 200 });

      const { result } = renderHook(() => useClientErrorLogger(defaultOptions));

      await result.current.logClientError({
        error: { some: "object" },
        correlationId: "test-id",
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody).toMatchObject({
        errorType: "UnexpectedError",
        errorMessage: "An unexpected error occurred",
      });
    });
  });

  describe("Email context", () => {
    it("should append email to error message when provided", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({ status: 200 });

      const { result } = renderHook(() => useClientErrorLogger(defaultOptions));

      await result.current.logClientError({
        error: new Error("Test error"),
        correlationId: "test-id",
        email: "user@example.com",
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.errorMessage).toContain("Email: user@example.com");
    });
  });

  describe("Logging failure handling", () => {
    it("should catch and console.error when error logging fails", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Logging failed"));

      const { result } = renderHook(() => useClientErrorLogger(defaultOptions));

      await result.current.logClientError({
        error: new Error("Original error"),
        correlationId: "test-id",
      });

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith("[Error Log] Failed to log error:", expect.any(Error));
      });
    });
  });

  describe("CSRF token", () => {
    it("should include CSRF token in request headers", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({ status: 200 });

      const { result } = renderHook(() => useClientErrorLogger(defaultOptions));

      await result.current.logClientError({
        error: new Error("Test"),
        correlationId: "test-id",
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/error-log",
          expect.objectContaining({
            headers: expect.objectContaining({
              "X-CSRF-Token": mockCsrfToken,
            }),
          })
        );
      });
    });
  });
});
