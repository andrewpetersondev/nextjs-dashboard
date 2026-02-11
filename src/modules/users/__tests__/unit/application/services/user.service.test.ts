import { beforeEach, describe, expect, it, type Mocked, vi } from "vitest";
import type { UserRepositoryContract } from "@/modules/users/application/contracts/user-repository.contract";
import { UserService } from "@/modules/users/application/services/user.service";
import type { UserEntity } from "@/modules/users/domain/entities/user.entity";
import type { HashingService } from "@/server/crypto/hashing/hashing.service";
import type { Hash } from "@/shared/branding/brands";
import { toUserId } from "@/shared/branding/converters/id-converters";
import { Err, Ok } from "@/shared/core/results/result";
import type { LoggingClientContract } from "@/shared/telemetry/logging/core/logging-client.contract";

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: fix later
describe("UserService", () => {
  let userService: UserService;
  let mockRepo: Mocked<UserRepositoryContract>;
  let mockHasher: Mocked<HashingService>;
  let mockLogger: Mocked<LoggingClientContract>;

  const mockUser: UserEntity = {
    email: "test@example.com",
    id: toUserId("550e8400-e29b-41d4-a716-446655440000"),
    password: "hashed-password" as Hash,
    role: "USER",
    sensitiveData: "some-data",
    username: "testuser",
  };

  beforeEach(() => {
    mockRepo = {
      create: vi.fn(),
      delete: vi.fn(),
      readById: vi.fn(),
      readFilteredUsers: vi.fn(),
      readPageCount: vi.fn(),
      update: vi.fn(),
      withTransaction: vi.fn(),
      // biome-ignore lint/suspicious/noExplicitAny: fix
    } as any;

    mockHasher = {
      compare: vi.fn(),
      hash: vi.fn().mockResolvedValue("hashed-password"),
      // biome-ignore lint/suspicious/noExplicitAny: fix
    } as any;

    mockLogger = {
      child: vi.fn().mockReturnThis(),
      error: vi.fn(),
      info: vi.fn(),
      // biome-ignore lint/suspicious/noExplicitAny: fix
    } as any;

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
      // biome-ignore lint/suspicious/noExplicitAny: fix
      const dbError = { key: "database", message: "DB Error" } as any;
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
      email: "new@example.com",
      password: "password123",
      role: "USER" as const,
      username: "newuser",
    };

    it("should return Ok(UserDto) when user is created successfully", async () => {
      mockRepo.create.mockResolvedValue(Ok(mockUser));

      const result = await userService.createUser(createData);

      expect(result.ok).toBe(true);
      expect(mockHasher.hash).toHaveBeenCalledWith(createData.password);
      expect(mockRepo.create).toHaveBeenCalled();
    });

    it("should return Err when repo fails to create", async () => {
      // biome-ignore lint/suspicious/noExplicitAny: fix
      const dbError = { key: "database", message: "DB Error" } as any;
      mockRepo.create.mockResolvedValue(Err(dbError));

      const result = await userService.createUser(createData);

      expect(result.ok).toBe(false);
    });
  });
});
