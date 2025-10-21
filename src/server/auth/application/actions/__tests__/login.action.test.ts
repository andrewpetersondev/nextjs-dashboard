import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LoginField } from "@/features/auth/lib/auth.schema";
import type { FormResult } from "@/shared/forms/types/form-result.types";
import { loginAction } from "../login.action";

// Create mocks
const mockAuthUserService = {
  login: vi.fn(),
};

const mockAuthUserServiceFactory = {
  createAuthUserService: vi.fn(() => mockAuthUserService),
};

const mockRedirect = vi.fn();
const mockSetSession = vi.fn();

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  redirect: mockRedirect,
}));

// Mock service factory
vi.mock(
  "@/server/auth/application/services/factories/auth-user-service.factory",
  () => ({
    createAuthUserService: mockAuthUserServiceFactory.createAuthUserService,
  }),
);

// Mock session helper
vi.mock("@/server/auth/infrastructure/session/set-session", () => ({
  setSession: mockSetSession,
}));

describe("loginAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should successfully login and redirect on valid credentials", async () => {
    const mockUser = {
      email: "test@example.com",
      id: "user-123",
      role: "user",
      username: "testuser",
    };

    mockAuthUserService.login.mockResolvedValue({
      ok: true,
      value: mockUser,
    });

    const formData = new FormData();
    formData.append("email", "test@example.com");
    formData.append("password", "SecurePass123!");

    const initialState: FormResult<LoginField, unknown> = {
      error: null,
      ok: false,
    };

    await loginAction(initialState, formData);

    expect(mockAuthUserService.login).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "SecurePass123!",
    });
    expect(mockSetSession).toHaveBeenCalledWith(mockUser);
    expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
  });

  it("should return error for invalid email", async () => {
    const formData = new FormData();
    formData.append("email", "invalid-email");
    formData.append("password", "SecurePass123!");

    const initialState: FormResult<LoginField, unknown> = {
      error: null,
      ok: false,
    };

    const result = await loginAction(initialState, formData);

    expect(result).toEqual({
      error: expect.stringContaining("email"),
      ok: false,
    });
    expect(mockAuthUserService.login).not.toHaveBeenCalled();
  });

  it("should return error when service login fails", async () => {
    mockAuthUserService.login.mockResolvedValue({
      error: {
        kind: "invalid_credentials",
        message: "Invalid email or password",
      },
      ok: false,
    });

    const formData = new FormData();
    formData.append("email", "test@example.com");
    formData.append("password", "WrongPassword123!");

    const initialState: FormResult<LoginField, unknown> = {
      error: null,
      ok: false,
    };

    const result = await loginAction(initialState, formData);

    expect(result).toEqual({
      error: expect.stringContaining("Invalid"),
      ok: false,
    });
    expect(mockSetSession).not.toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("should return error for missing password", async () => {
    const formData = new FormData();
    formData.append("email", "test@example.com");
    formData.append("password", "");

    const initialState: FormResult<LoginField, unknown> = {
      error: null,
      ok: false,
    };

    const result = await loginAction(initialState, formData);

    expect(result).toEqual({
      error: expect.stringContaining("password"),
      ok: false,
    });
    expect(mockAuthUserService.login).not.toHaveBeenCalled();
  });
});
