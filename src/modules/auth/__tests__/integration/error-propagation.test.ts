import { beforeEach, describe, expect, it, vi } from "vitest";
import { loginAction } from "@/modules/auth/presentation/authn/actions/login.action";
import { signupAction } from "@/modules/auth/presentation/authn/actions/signup.action";
import { getAppDb } from "@/server/db/db.connection";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import { getFormErrorPayload } from "@/shared/forms/logic/inspectors/form-error.inspector";

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: how can i fix this?
describe("Auth Error Propagation Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createFormData = (
    email = "test@example.com",
    password = "Password123!",
  ) => {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("username", "testuser");
    return formData;
  };

  // biome-ignore lint/complexity/noExcessiveLinesPerFunction: close enough
  describe("Database Errors", () => {
    it("should propagate DB connection failure during login as a form-level error", async () => {
      const db = getAppDb();
      const originalSelect = db.select;
      vi.spyOn(db, "select").mockImplementationOnce(() => {
        throw new Error("Connection refused");
      });

      const result = await loginAction(
        {} as FormResult<unknown>,
        createFormData(),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        const payload = getFormErrorPayload(result.error);
        expect(payload.formErrors.length).toBeGreaterThan(0);
        // It's wrapped in safeExecute which maps to 'unexpected'
        expect(result.error.key).toBe(APP_ERROR_KEYS.unexpected);
      }
      db.select = originalSelect;
    });

    it("should propagate DB constraint violation during signup as a conflict error", async () => {
      const db = getAppDb();
      const originalInsert = db.insert;

      // Mock a Postgres unique violation (code 23505)
      // It must have APP_ERROR_KEYS.integrity for the mapper to work
      const pgError = new Error(
        "duplicate key value violates unique constraint",
      );
      // biome-ignore lint/suspicious/noExplicitAny: is this okay?
      (pgError as any).code = "23505";
      // biome-ignore lint/suspicious/noExplicitAny: is this okay?
      (pgError as any).constraint = "users_email_unique";

      vi.spyOn(db, "insert").mockImplementationOnce(() => {
        throw pgError;
      });

      const result = await signupAction(
        {} as FormResult<unknown>,
        createFormData(),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.key).toBe(APP_ERROR_KEYS.conflict);
        const payload = getFormErrorPayload(result.error);
        expect(payload.formErrors.length).toBeGreaterThan(0);
        const firstFormError = payload.formErrors[0];
        expect(firstFormError).toBeDefined();
        expect(firstFormError?.toLowerCase()).toMatch(
          // biome-ignore lint/performance/useTopLevelRegex: TODO extract later
          /already in use|exists|conflict|unique/,
        );
      }
      db.insert = originalInsert;
    });
  });

  // biome-ignore lint/complexity/noExcessiveLinesPerFunction: how can i fix this?
  describe("Infrastructure Service Errors", () => {
    it("should handle hashing failure during signup gracefully", async () => {
      // We need to mock the hasher used in SignupUseCase
      // Since it's injected via makeAuthComposition, we can mock the module
      const { BcryptPasswordService } = await import(
        "@/modules/auth/infrastructure/crypto/services/bcrypt-password.service"
      );
      vi.spyOn(BcryptPasswordService.prototype, "hash").mockRejectedValueOnce(
        new Error("CPU exhausted"),
      );

      const result = await signupAction(
        {} as FormResult<unknown>,
        createFormData(),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.key).toBe(APP_ERROR_KEYS.unexpected);
        const payload = getFormErrorPayload(result.error);
        // Be flexible with message content as it might be 'CPU exhausted' or a wrapped message
        expect(payload.message.toLowerCase()).toMatch(
          // biome-ignore lint/performance/useTopLevelRegex: TODO extract later
          /failed|exhausted|unexpected/,
        );
      }
    });

    it("should handle JWT signing failure during login gracefully", async () => {
      const { JoseSessionJwtCryptoService } = await import(
        "@/modules/auth/infrastructure/session/services/jose-session-jwt-crypto.service"
      );
      vi.spyOn(
        JoseSessionJwtCryptoService.prototype,
        "sign",
      ).mockRejectedValueOnce(new Error("Keystore unavailable"));

      // Ensure user is found so it proceeds to session establishment
      const db = getAppDb();
      const originalSelect = db.select;
      vi.spyOn(db, "select").mockReturnValue({
        from: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            email: "test@example.com",
            id: "user-123",
            password: "hashed_password", // We also need to mock hasher.compare to return true
            role: "USER",
            username: "testuser",
          },
        ]),
        where: vi.fn().mockReturnThis(),
        // biome-ignore lint/suspicious/noExplicitAny: is this okay?
      } as any);

      const { BcryptPasswordService } = await import(
        "@/modules/auth/infrastructure/crypto/services/bcrypt-password.service"
      );
      vi.spyOn(BcryptPasswordService.prototype, "compare").mockResolvedValue({
        ok: true,
        value: true,
        // biome-ignore lint/suspicious/noExplicitAny: is this okay?
      } as any);

      const result = await loginAction(
        {} as FormResult<unknown>,
        createFormData(),
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        // It should be wrapped in safeExecute in LoginWorkflow or EstablishSessionUseCase
        const payload = getFormErrorPayload(result.error);
        expect(payload.message).toContain("unexpected error occurred");
      }

      db.select = originalSelect;
    });
  });
});
