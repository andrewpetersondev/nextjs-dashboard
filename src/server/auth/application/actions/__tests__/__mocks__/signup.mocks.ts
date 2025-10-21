import { vi } from "vitest";

export const mockAuthUserService = {
  signup: vi.fn(),
};

export const mockAuthUserServiceFactory = {
  createAuthUserService: vi.fn(() => mockAuthUserService),
};

export const mockRedirect = vi.fn();

export const mockSetSession = vi.fn();
