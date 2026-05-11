import { vi } from "vitest";
import {
	mockNextCache,
	mockNextHeaders,
	mockNextNavigation,
} from "./test-support/next-mocks";

// Mock the server-only package to prevent "Client Component" errors in tests
// This allows importing server-only modules in unit tests
vi.mock("server-only", () => ({}));

// Centralized Next.js Mocks
vi.mock("next/navigation", () => mockNextNavigation());
vi.mock("next/cache", () => mockNextCache());
vi.mock("next/headers", () => mockNextHeaders());
