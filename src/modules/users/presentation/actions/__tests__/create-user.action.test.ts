import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import {
  USER_ERROR_MESSAGES,
  USER_SUCCESS_MESSAGES,
} from "@/modules/users/domain/constants/user.constants";
import { CreateUserFormSchema } from "@/modules/users/domain/schemas/user.schema";
import { createUserService } from "@/modules/users/infrastructure/factories/user-service.factory";
import { getAppDb } from "@/server/db/db.connection";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import {
  makeFormError,
  makeFormOk,
} from "@/shared/forms/logic/factories/form-result.factory";
import { resolveCanonicalFieldNames } from "@/shared/forms/logic/inspectors/zod-schema.inspector";
import { makeEmptyDenseFieldErrorMap } from "@/shared/forms/logic/mappers/field-error-map.factory";
import { validateForm } from "@/shared/forms/server/validate-form.logic";
import { Err, Ok } from "@/shared/results/result";
import { createUserAction } from "../create-user.action";

vi.mock("@/shared/forms/server/validate-form.logic");
vi.mock("@/modules/users/infrastructure/factories/user-service.factory");
vi.mock("@/server/db/db.connection");
vi.mock(
  "@/shared/forms/logic/factories/form-result.factory",
  async (importOriginal) => {
    // biome-ignore lint/suspicious/noExplicitAny: fix
    const actual = await importOriginal<any>();
    return {
      ...actual,
      makeFormError: vi.fn(actual.makeFormError),
      makeFormOk: vi.fn(actual.makeFormOk),
    };
  },
);

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: TODO
describe("createUserAction", () => {
  const mockFields = resolveCanonicalFieldNames(CreateUserFormSchema);
  // biome-ignore lint/suspicious/noExplicitAny: fix
  const prevState = {} as any;
  const formData = new FormData();

  const mockService = {
    createUser: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createUserService as Mock).mockReturnValue(mockService);
    (getAppDb as Mock).mockReturnValue({});
  });

  it("should return success when user is created successfully", async () => {
    const validData = {
      email: "test@example.com",
      password: "password123",
      role: "USER" as const,
      username: "testuser",
    };

    (validateForm as Mock).mockResolvedValue(makeFormOk(validData, ""));
    mockService.createUser.mockResolvedValue(Ok({ id: "1", ...validData }));

    const result = await createUserAction(prevState, formData);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.message).toBe(USER_SUCCESS_MESSAGES.createSuccess);
    }
    expect(mockService.createUser).toHaveBeenCalledWith(validData);
  });

  it("should return validation error when validateForm fails", async () => {
    const validationError = makeFormError({
      fieldErrors: makeEmptyDenseFieldErrorMap(mockFields),
      formData: {},
      formErrors: ["Invalid input"],
      key: APP_ERROR_KEYS.validation,
      message: "Validation failed",
    });

    (validateForm as Mock).mockResolvedValue(validationError);

    const result = await createUserAction(prevState, formData);

    expect(result.ok).toBe(false);
    expect(result).toEqual(validationError);
    expect(mockService.createUser).not.toHaveBeenCalled();
  });

  it("should return form error when service.createUser fails", async () => {
    const validData = {
      email: "test@example.com",
      password: "password123",
      role: "USER" as const,
      username: "testuser",
    };

    (validateForm as Mock).mockResolvedValue(makeFormOk(validData, ""));
    const serviceError = {
      key: APP_ERROR_KEYS.validation,
      message: "Email already exists",
    };
    mockService.createUser.mockResolvedValue(Err(serviceError));

    const result = await createUserAction(prevState, formData);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.key).toBe(APP_ERROR_KEYS.validation);
      expect(result.error.message).toBe("Email already exists");
    }
  });

  it("should return unexpected error when an exception is thrown", async () => {
    (validateForm as Mock).mockRejectedValue(new Error("Unexpected"));

    const result = await createUserAction(prevState, formData);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.key).toBe(APP_ERROR_KEYS.unexpected);
      expect(result.error.message).toBe(USER_ERROR_MESSAGES.unexpected);
    }
  });
});
