import { makeMockLogger } from "@test-support/mocks/logger.mock";
import { describe, expect, it, vi } from "vitest";
import type { AuthUserCreateDto } from "@/modules/auth/application/auth-user/dtos/requests/auth-user-create.dto";
import { AuthUserRepository } from "@/modules/auth/infrastructure/persistence/auth-user/auth-user.repository";

vi.mock(
	"@/modules/auth/infrastructure/persistence/auth-user/dal/insert-user.dal",
	() => {
		return {
			insertUserDal: vi.fn(() => {
				throw new Error("insertUserDal should not be called for invalid input");
			}),
		};
	},
);

describe("AuthUserRepository.signup final-gate validation", () => {
	it("should return Err before calling insertUserDal when AuthUserCreateDto is invalid", async () => {
		const { insertUserDal } = await import(
			"@/modules/auth/infrastructure/persistence/auth-user/dal/insert-user.dal"
		);

		const fakeDb = {};
		const logger = makeMockLogger();

		const repo = new AuthUserRepository(
			// biome-ignore lint/suspicious/noExplicitAny: minimal DB double; signup must reject before the DB is ever touched
			fakeDb as any,
			logger,
			"request-id",
		);

		const invalidInput: AuthUserCreateDto = {
			email: "missing-at-symbol",
			// @ts-expect-error AuthUserCreateDto expects pre-hashed password
			password: "password",
			role: "USER",
			username: "u",
		};

		const result = await repo.signup(invalidInput);

		expect(result.ok).toBe(false);
		expect(insertUserDal).not.toHaveBeenCalled();
	});
});
