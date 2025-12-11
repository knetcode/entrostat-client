import "@testing-library/jest-dom";

// Mock crypto.randomUUID
if (typeof global.crypto === "undefined") {
  global.crypto = {
    randomUUID: () => "00000000-0000-0000-0000-000000000000",
  } as Crypto;
}

// Mock Response class for jsdom
if (typeof global.Response === "undefined") {
  global.Response = class Response {
    public status: number;
    public statusText: string;
    public ok: boolean;
    private body: unknown;

    constructor(body?: BodyInit | null, init?: ResponseInit) {
      this.body = body;
      this.status = init?.status || 200;
      this.statusText = init?.statusText || "";
      this.ok = this.status >= 200 && this.status < 300;
    }

    async json() {
      return this.body;
    }
  } as unknown as typeof Response;
}

// Mock ResizeObserver
if (typeof global.ResizeObserver === "undefined") {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// Mock document.elementFromPoint for input-otp library
if (typeof document !== "undefined" && typeof document.elementFromPoint !== "function") {
  document.elementFromPoint = () => null;
}

// Mock fetch globally
global.fetch = jest.fn();

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
  })),
  usePathname: jest.fn(() => "/"),
}));

// NOTE: We do NOT mock next/server globally here because the API route tests
// (which use @jest-environment node) need the actual NextRequest/NextResponse classes.
// If you need to mock NextResponse in a specific test, do it in that test file.

// Reset mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});
