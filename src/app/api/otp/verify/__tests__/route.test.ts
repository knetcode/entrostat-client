/**
 * Tests for /api/otp/verify route handler
 * Tests the Next.js API route that proxies OTP verify requests to the backend
 * @jest-environment node
 */

import { NextRequest } from "next/server";
import { POST } from "../route";

// Mock the env module
jest.mock("@/src/env.mjs", () => ({
  env: {
    BE_SERVER_URL: "http://localhost:3001",
  },
}));

// Mock the error logging
jest.mock("../../../error-log/route", () => ({
  serverLogErrorToApi: jest.fn(),
}));

describe("POST /api/otp/verify", () => {
  const validCorrelationId = "550e8400-e29b-41d4-a716-446655440000";
  const validEmail = "test@example.com";
  const validOtp = "123456";

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Success cases", () => {
    it("should successfully proxy verify request to backend", async () => {
      const mockBackendResponse = {
        success: true,
        valid: true,
        message: "OTP verified successfully",
        correlationId: validCorrelationId,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        json: async () => mockBackendResponse,
      });

      const request = new NextRequest("http://localhost:3000/api/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          correlationId: validCorrelationId,
        },
        body: JSON.stringify({ email: validEmail, otp: validOtp }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockBackendResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/otp/verify",
        expect.objectContaining({
          method: "post",
          headers: expect.objectContaining({
            "content-type": "application/json",
            correlationId: validCorrelationId,
          }),
          body: JSON.stringify({ email: validEmail, otp: validOtp }),
        })
      );
    });

    it("should handle valid OTP response", async () => {
      const mockBackendResponse = {
        success: true,
        valid: true,
        message: "OTP verified successfully",
        correlationId: validCorrelationId,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        json: async () => mockBackendResponse,
      });

      const request = new NextRequest("http://localhost:3000/api/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          correlationId: validCorrelationId,
        },
        body: JSON.stringify({ email: validEmail, otp: validOtp }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.valid).toBe(true);
    });

    it("should forward invalid OTP response from backend", async () => {
      const mockBackendResponse = {
        success: false,
        message: "Invalid or expired OTP",
        correlationId: validCorrelationId,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 400,
        json: async () => mockBackendResponse,
      });

      const request = new NextRequest("http://localhost:3000/api/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          correlationId: validCorrelationId,
        },
        body: JSON.stringify({ email: validEmail, otp: "000000" }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toEqual(mockBackendResponse);
    });
  });

  describe("Validation errors", () => {
    it("should reject request without correlationId header", async () => {
      const request = new NextRequest("http://localhost:3000/api/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: validEmail, otp: validOtp }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toMatchObject({
        success: false,
        message: expect.stringContaining("Invalid request"),
      });
    });

    it("should reject request with invalid correlationId format", async () => {
      const request = new NextRequest("http://localhost:3000/api/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          correlationId: "not-a-uuid",
        },
        body: JSON.stringify({ email: validEmail, otp: validOtp }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it("should reject request with invalid email format", async () => {
      const request = new NextRequest("http://localhost:3000/api/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          correlationId: validCorrelationId,
        },
        body: JSON.stringify({ email: "not-an-email", otp: validOtp }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it("should reject request with invalid OTP format (not 6 digits)", async () => {
      const request = new NextRequest("http://localhost:3000/api/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          correlationId: validCorrelationId,
        },
        body: JSON.stringify({ email: validEmail, otp: "12345" }), // Only 5 digits
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it("should reject request with non-numeric OTP", async () => {
      const request = new NextRequest("http://localhost:3000/api/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          correlationId: validCorrelationId,
        },
        body: JSON.stringify({ email: validEmail, otp: "abcdef" }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it("should reject request with missing email", async () => {
      const request = new NextRequest("http://localhost:3000/api/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          correlationId: validCorrelationId,
        },
        body: JSON.stringify({ otp: validOtp }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it("should reject request with missing OTP", async () => {
      const request = new NextRequest("http://localhost:3000/api/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          correlationId: validCorrelationId,
        },
        body: JSON.stringify({ email: validEmail }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });

  describe("OTP format requirements", () => {
    it("should accept OTP starting with 0", async () => {
      const mockBackendResponse = {
        success: true,
        valid: true,
        message: "OTP verified successfully",
        correlationId: validCorrelationId,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        json: async () => mockBackendResponse,
      });

      const request = new NextRequest("http://localhost:3000/api/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          correlationId: validCorrelationId,
        },
        body: JSON.stringify({ email: validEmail, otp: "012345" }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining("012345"),
        })
      );
    });

    it("should trim whitespace from OTP", async () => {
      const mockBackendResponse = {
        success: true,
        valid: true,
        message: "OTP verified successfully",
        correlationId: validCorrelationId,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        json: async () => mockBackendResponse,
      });

      const request = new NextRequest("http://localhost:3000/api/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          correlationId: validCorrelationId,
        },
        body: JSON.stringify({ email: validEmail, otp: "  123456  " }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"otp":"123456"'),
        })
      );
    });
  });

  describe("Backend error handling", () => {
    it("should handle backend 500 error", async () => {
      const mockBackendResponse = {
        success: false,
        message: "Internal server error",
        correlationId: validCorrelationId,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 500,
        json: async () => mockBackendResponse,
      });

      const request = new NextRequest("http://localhost:3000/api/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          correlationId: validCorrelationId,
        },
        body: JSON.stringify({ email: validEmail, otp: validOtp }),
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toEqual(mockBackendResponse);
    });

    it("should handle backend JSON parsing error", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });

      const request = new NextRequest("http://localhost:3000/api/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          correlationId: validCorrelationId,
        },
        body: JSON.stringify({ email: validEmail, otp: validOtp }),
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toMatchObject({
        success: false,
        message: expect.stringContaining("error processing the response"),
      });
    });

    it("should handle fetch network error", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

      const request = new NextRequest("http://localhost:3000/api/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          correlationId: validCorrelationId,
        },
        body: JSON.stringify({ email: validEmail, otp: validOtp }),
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toMatchObject({
        success: false,
        message: expect.stringContaining("Something went wrong"),
      });
    });
  });

  describe("Cache control headers", () => {
    it("should include no-cache headers in backend request", async () => {
      const mockBackendResponse = {
        success: true,
        valid: true,
        message: "OTP verified successfully",
        correlationId: validCorrelationId,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        json: async () => mockBackendResponse,
      });

      const request = new NextRequest("http://localhost:3000/api/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          correlationId: validCorrelationId,
        },
        body: JSON.stringify({ email: validEmail, otp: validOtp }),
      });

      await POST(request);

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
