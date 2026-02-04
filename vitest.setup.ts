// Vitest setup file to handle Next.js server-only modules and common mocks in tests
import { config } from "dotenv";
import { vi } from "vitest";

// Load test environment variables from .env.test.local
config({ path: ".env.test.local" });

// Mock the server-only package to prevent "Client Component" errors in tests
// This allows importing server-only modules in unit tests
vi.mock("server-only", () => ({}));

// Centralized Next.js Mocks
vi.mock("next/navigation", () => ({
  redirect: vi.fn((path) => {
    const error = new Error("NEXT_REDIRECT");
    // biome-ignore lint/suspicious/noExplicitAny: keep until a better solution
    (error as any).digest = `NEXT_REDIRECT;${path}`;
    throw error;
  }),
  usePathname: vi.fn(),
  useRouter: vi.fn(() => ({
    back: vi.fn(),
    forward: vi.fn(),
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
  })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("next/headers", () => {
  const mockHeaders = new Map([
    ["user-agent", "test-agent"],
    ["x-forwarded-for", "127.0.0.1"],
  ]);
  const mockCookies = {
    delete: vi.fn(),
    get: vi.fn(),
    getAll: vi.fn(),
    has: vi.fn(),
    set: vi.fn(),
  };
  return {
    cookies: vi.fn(() => mockCookies),
    headers: vi.fn(async () => mockHeaders),
  };
});
