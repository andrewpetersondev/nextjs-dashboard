import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SignupField } from "@/features/auth/lib/auth.schema";
import type { SessionUser } from "@/features/auth/sessions/session-action.types";
import type { UserId } from "@/shared/domain/domain-brands";
import type { FormResult } from "@/shared/forms/types/form-result.types";
import { signupAction } from "../signup.action";
import {
  mockAuthUserService,
  mockAuthUserServiceFactory,
  mockRedirect,
  mockSetSession,
} from "./__mocks__/signup.mocks";

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

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <fix later>
describe("signupAction", () => {
  const initialState: FormResult<SignupField, SessionUser> = {
    error: {
      code: "VALIDATION",
      fieldErrors: {
        email: [],
        password: [],
        username: [],
      },
      kind: "validation",
      message: "",
    },
    ok: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return error for invalid email", async () => {
    const formData = new FormData();
    formData.append("email", "invalid-email");
    formData.append("password", "SecurePass123!");
    formData.append("username", "testuser");

    const result = await signupAction(initialState, formData);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain("email");
    }
    expect(mockAuthUserService.signup).not.toHaveBeenCalled();
  });

  it("should return error when service signup fails", async () => {
    mockAuthUserService.signup.mockResolvedValue({
      error: {
        code: "CONFLICT",
        kind: "conflict",
        message: "Email already exists",
      },
      ok: false,
    });

    const formData = new FormData();
    formData.append("email", "test@example.com");
    formData.append("password", "SecurePass123!");
    formData.append("username", "testuser");

    const result = await signupAction(initialState, formData);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain("Email already exists");
    }
    expect(mockSetSession).not.toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("should return error for weak password", async () => {
    const formData = new FormData();
    formData.append("email", "test@example.com");
    formData.append("password", "123");
    formData.append("username", "testuser");

    const result = await signupAction(initialState, formData);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain("password");
    }
    expect(mockAuthUserService.signup).not.toHaveBeenCalled();
  });

  it("should successfully signup and redirect on valid data", async () => {
    const mockSessionUser: SessionUser = {
      id: "user-123" as UserId,
      role: "USER",
    };

    mockAuthUserService.signup.mockResolvedValue({
      ok: true,
      value: mockSessionUser,
    });

    const formData = new FormData();
    formData.append("email", "test@example.com");
    formData.append("password", "SecurePass123!");
    formData.append("username", "testuser");

    await signupAction(initialState, formData);

    expect(mockAuthUserService.signup).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "SecurePass123!",
      username: "testuser",
    });
    expect(mockSetSession).toHaveBeenCalledWith(mockSessionUser);
    expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
  });
});
