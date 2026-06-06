import {
	makeUserEntity,
	TEST_EMAIL,
	TEST_PASSWORD,
	TEST_PASSWORD_HASH,
	TEST_USERNAME,
} from "@test-support/fixtures/user.fixtures";
import { makeMockHashingService } from "@test-support/mocks/hashing.mock";
import { makeMockLogger } from "@test-support/mocks/logger.mock";
import { makeMockUserRepository } from "@test-support/mocks/user-repository.mock";
import { beforeEach, describe, expect, it } from "vitest";
import { UserService } from "@/modules/users/application/services/user.service";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import { Err, Ok } from "@/shared/core/result/result";

describe("UserService", () => {
	const mockUser = makeUserEntity();
	let userService: UserService;
	let mockRepo: ReturnType<typeof makeMockUserRepository>;
	let mockHasher: ReturnType<typeof makeMockHashingService>;
	let mockLogger: ReturnType<typeof makeMockLogger>;

	beforeEach(() => {
		mockRepo = makeMockUserRepository();
		mockHasher = makeMockHashingService();
		mockHasher.hash.mockResolvedValue(TEST_PASSWORD_HASH);
		mockLogger = makeMockLogger();
		userService = new UserService(mockRepo, mockHasher, mockLogger);
	});

	describe("readUserById", () => {
		it("should return Ok(UserDto) when user exists", async () => {
			mockRepo.readById.mockResolvedValue(Ok(mockUser));

			const result = await userService.readUserById(mockUser.id);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value?.id).toBe(String(mockUser.id));
				expect(result.value?.email).toBe(mockUser.email);
			}
		});

		it("should return Ok(null) when user does not exist", async () => {
			mockRepo.readById.mockResolvedValue(Ok(null));

			const result = await userService.readUserById(mockUser.id);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBeNull();
			}
		});

		it("should return Err when repo fails", async () => {
			const dbError = {
				key: "database",
				message: "DB Error",
			} as unknown as AppError;
			mockRepo.readById.mockResolvedValue(Err(dbError));

			const result = await userService.readUserById(mockUser.id);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.key).toBe("database");
			}
		});
	});

	describe("createUser", () => {
		const createData = {
			email: TEST_EMAIL,
			password: TEST_PASSWORD,
			role: "USER" as const,
			username: TEST_USERNAME,
		};

		it("should return Ok(UserDto) when user is created successfully", async () => {
			mockRepo.create.mockResolvedValue(Ok(mockUser));

			const result = await userService.createUser(createData);

			expect(result.ok).toBe(true);
			expect(mockHasher.hash).toHaveBeenCalledWith(createData.password);
			expect(mockRepo.create).toHaveBeenCalled();
		});

		it("should return Err when repo fails to create", async () => {
			const dbError = {
				key: "database",
				message: "DB Error",
			} as unknown as AppError;
			mockRepo.create.mockResolvedValue(Err(dbError));

			const result = await userService.createUser(createData);

			expect(result.ok).toBe(false);
		});
	});
});
