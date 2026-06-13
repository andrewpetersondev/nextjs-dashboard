import {
	TEST_EMAIL,
	TEST_PASSWORD,
	TEST_USERNAME,
} from "@test-support/fixtures/user.fixtures";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { requireAdmin } from "@/modules/auth/presentation/session/session-access.guard";
import {
	USER_ERROR_MESSAGES,
	USER_SUCCESS_MESSAGES,
} from "@/modules/users/domain/constants/user.constants";
import { CreateUserFormSchema } from "@/modules/users/domain/schemas/user.schema";
import { createUserService } from "@/modules/users/infrastructure/factories/user-service.factory";
import { createUserAction } from "@/modules/users/presentation/actions/create-user.action";
import { getAppDb } from "@/server/db/db.connection";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";
import { makeAppError } from "@/shared/core/errors/core/factories/app-error.factory";
import { Err, Ok } from "@/shared/core/result/result";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import {
	makeFormError,
	makeFormOk,
} from "@/shared/forms/logic/factories/form-result.factory";
import { resolveCanonicalFieldNames } from "@/shared/forms/logic/inspectors/zod-schema.inspector";
import { makeEmptyDenseFieldErrorMap } from "@/shared/forms/logic/mappers/field-error-map.mapper";
import { validateForm } from "@/shared/forms/server/validate-form";

vi.mock("@/shared/forms/server/validate-form");
vi.mock("@/modules/users/infrastructure/factories/user-service.factory");
vi.mock("@/server/db/db.connection");
vi.mock("@/modules/auth/presentation/session/session-access.guard", () => ({
	requireAdmin: vi.fn().mockResolvedValue({
		isAuthorized: true,
		role: "ADMIN",
		userId: "admin-1",
	}),
}));
vi.mock(
	"@/shared/forms/logic/factories/form-result.factory",
	async (importOriginal) => {
		const actual =
			await importOriginal<
				typeof import("@/shared/forms/logic/factories/form-result.factory")
			>();
		return {
			...actual,
			makeFormError: vi.fn(actual.makeFormError),
			makeFormOk: vi.fn(actual.makeFormOk),
		};
	},
);

describe("createUserAction", () => {
	const mockFields = resolveCanonicalFieldNames(CreateUserFormSchema);
	const prevState = {} as FormResult<unknown>;
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
			email: TEST_EMAIL,
			password: TEST_PASSWORD,
			role: "USER" as const,
			username: TEST_USERNAME,
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
			email: TEST_EMAIL,
			password: TEST_PASSWORD,
			role: "USER" as const,
			username: TEST_USERNAME,
		};

		(validateForm as Mock).mockResolvedValue(makeFormOk(validData, ""));
		const serviceError = makeAppError(APP_ERROR_KEYS.validation, {
			cause: "",
			message: "Email already exists",
			metadata: {
				fieldErrors: makeEmptyDenseFieldErrorMap(mockFields),
				formData: {},
				formErrors: [],
			},
		});
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

	it("enforces admin authorization before creating a user", async () => {
		const validData = {
			email: TEST_EMAIL,
			password: TEST_PASSWORD,
			role: "USER" as const,
			username: TEST_USERNAME,
		};

		(validateForm as Mock).mockResolvedValue(makeFormOk(validData, ""));
		mockService.createUser.mockResolvedValue(Ok({ id: "1", ...validData }));

		await createUserAction(prevState, formData);

		expect(requireAdmin).toHaveBeenCalledTimes(1);
	});
});
