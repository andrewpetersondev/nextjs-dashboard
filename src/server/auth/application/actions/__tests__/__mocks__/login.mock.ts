import { vi } from "vitest";

export const mockAuthUserService = {
  login: vi.fn(),
};

export const mockAuthUserServiceFactory = {
  createAuthUserService: vi.fn(() => mockAuthUserService),
};

export const mockRedirect = vi.fn();

export const mockSetSession = vi.fn();
