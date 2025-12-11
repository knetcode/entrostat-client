/**
 * Tests for /api/otp/resend route handler
 * Tests the Next.js API route that proxies OTP resend requests to the backend
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

describe("POST /api/otp/resend", () => {
  const validCorrelationId = "550e8400-e29b-41d4-a716-446655440000";
  const validEmail = "test@example.com";

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Success cases", () => {
    it("should successfully proxy resend request to backend", async () => {
      const mockBackendResponse = {
        success: true,
        message: "OTP resent successfully",
        correlationId: validCorrelationId,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        json: async () => mockBackendResponse,
      });

      const request = new NextRequest("http://localhost:3000/api/otp/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          correlationId: validCorrelationId,
        },
        body: JSON.stringify({ email: validEmail }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockBackendResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/otp/resend",
        expect.objectContaining({
          method: "post",
          headers: expect.objectContaining({
            "content-type": "application/json",
            correlationId: validCorrelationId,
          }),
          body: JSON.stringify({ email: validEmail }),
        })
      );
    });

    it("should forward 400 error when no OTP exists", async () => {
      const mockBackendResponse = {
        success: false,
        message: "No OTP code found for this email. Please request a new one to continue.",
        correlationId: validCorrelationId,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 400,
        json: async () => mockBackendResponse,
      });

      const request = new NextRequest("http://localhost:3000/api/otp/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          correlationId: validCorrelationId,
        },
        body: JSON.stringify({ email: validEmail }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual(mockBackendResponse);
    });

    it("should forward 400 error when max resends exceeded", async () => {
      const mockBackendResponse = {
        success: false,
        message: "You've reached the maximum number of resends (3). Please request a new OTP code.",
        correlationId: validCorrelationId,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 400,
        json: async () => mockBackendResponse,
      });

      const request = new NextRequest("http://localhost:3000/api/otp/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          correlationId: validCorrelationId,
        },
        body: JSON.stringify({ email: validEmail }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual(mockBackendResponse);
    });
  });

  describe("Validation errors", () => {
    it("should reject request without correlationId header", async () => {
      const request = new NextRequest("http://localhost:3000/api/otp/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: validEmail }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toMatchObject({
        success: false,
        message: expect.stringContaining("Invalid request"),
      });
    });

    it("should reject request with invalid correlationId format", async () => {
      const request = new NextRequest("http://localhost:3000/api/otp/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          correlationId: "invalid-uuid",
        },
        body: JSON.stringify({ email: validEmail }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it("should reject request with invalid email format", async () => {
      const request = new NextRequest("http://localhost:3000/api/otp/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          correlationId: validCorrelationId,
        },
        body: JSON.stringify({ email: "not-an-email" }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it("should reject request with missing email", async () => {
      const request = new NextRequest("http://localhost:3000/api/otp/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          correlationId: validCorrelationId,
        },
        body: JSON.stringify({}),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
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

      const request = new NextRequest("http://localhost:3000/api/otp/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          correlationId: validCorrelationId,
        },
        body: JSON.stringify({ email: validEmail }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual(mockBackendResponse);
    });

    it("should handle backend JSON parsing error", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });

      const request = new NextRequest("http://localhost:3000/api/otp/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          correlationId: validCorrelationId,
        },
        body: JSON.stringify({ email: validEmail }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toMatchObject({
        success: false,
        message: expect.stringContaining("error processing the response"),
      });
    });

    it("should handle fetch network error", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

      const request = new NextRequest("http://localhost:3000/api/otp/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          correlationId: validCorrelationId,
        },
        body: JSON.stringify({ email: validEmail }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
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
        message: "OTP resent successfully",
        correlationId: validCorrelationId,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        json: async () => mockBackendResponse,
      });

      const request = new NextRequest("http://localhost:3000/api/otp/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          correlationId: validCorrelationId,
        },
        body: JSON.stringify({ email: validEmail }),
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
