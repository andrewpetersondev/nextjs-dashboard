// Vitest setup file to handle Next.js server-only modules in tests
import { config } from "dotenv";
import { vi } from "vitest";

// Load test environment variables from .env.test.local
config({ path: ".env.test.local" });

// Mock the server-only package to prevent "Client Component" errors in tests
// This allows importing server-only modules in unit tests
vi.mock("server-only", () => ({}));
