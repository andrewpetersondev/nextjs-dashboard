import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LoggingClientContract } from "@/shared/infrastructure/logging/core/logger.contracts";
import type { AuthUserRepositoryPort } from "../../ports/auth-user-repository.port";
import type { PasswordHasherPort } from "../../ports/password-hasher.port";
import { AuthUserService } from "../auth-user.service";

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: test suite requires multiple scenarios
describe("AuthUserService", () => {
  let mockRepo: AuthUserRepositoryPort;
  let mockHasher: PasswordHasherPort;
  let mockLogger: LoggingClientContract;
  let service: AuthUserService;

  beforeEach(() => {
    mockRepo = {
      login: vi.fn(),
      signup: vi.fn(),
      withTransaction: vi.fn((fn) => fn(mockRepo)),
    };

    mockHasher = {
      compare: vi.fn(),
      hash: vi.fn(),
    };

    mockLogger = {
      child: vi.fn().mockReturnThis(),
      debug: vi.fn(),
      error: vi.fn(),
      errorWithDetails: vi.fn(),
      info: vi.fn(),
      operation: vi.fn(),
      trace: vi.fn(),
      warn: vi.fn(),
      withContext: vi.fn().mockReturnThis(),
      withRequest: vi.fn().mockReturnThis(),
    } as unknown as LoggingClientContract;

    service = new AuthUserService(mockRepo, mockHasher, mockLogger);
  });

  describe("signup", () => {
    it("should successfully create a user with hashed password", async () => {
      const mockHashedPassword = "hashed_password_123";
      const mockUserRecord = {
        email: "test@example.com",
        id: "550e8400-e29b-41d4-a716-446655440000",
        password: mockHashedPassword,
        role: "USER",
        sensitiveData: "",
        username: "testuser",
      };

      mockHasher.hash = vi.fn().mockResolvedValue(mockHashedPassword);
      mockRepo.signup = vi.fn().mockResolvedValue(mockUserRecord);

      const result = await service.signup({
        email: "test@example.com",
        password: "SecurePass123!",
        username: "testuser",
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.email).toBe("test@example.com");
        expect(result.value.username).toBe("testuser");
        expect(result.value.role).toBe("USER");
      }
      expect(mockHasher.hash).toHaveBeenCalledWith("SecurePass123!");
      expect(mockRepo.signup).toHaveBeenCalledWith({
        email: "test@example.com",
        password: mockHashedPassword,
        role: "USER",
        username: "testuser",
      });
    });

    it("should return error when missing required fields", async () => {
      const result = await service.signup({
        email: "",
        password: "SecurePass123!",
        username: "testuser",
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("validation");
      }
      expect(mockRepo.signup).not.toHaveBeenCalled();
    });
  });

  // biome-ignore lint/complexity/noExcessiveLinesPerFunction: login tests need multiple scenarios
  describe("login", () => {
    it("should successfully login with valid credentials", async () => {
      const mockUserRecord = {
        email: "test@example.com",
        id: "550e8400-e29b-41d4-a716-446655440000",
        password: "hashed_password_123",
        role: "USER",
        sensitiveData: "",
        username: "testuser",
      };

      mockRepo.login = vi.fn().mockResolvedValue(mockUserRecord);
      mockHasher.compare = vi.fn().mockResolvedValue(true);

      const result = await service.login({
        email: "test@example.com",
        password: "SecurePass123!",
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.email).toBe("test@example.com");
        expect(result.value.id).toBe("550e8400-e29b-41d4-a716-446655440000");
      }
      expect(mockRepo.login).toHaveBeenCalledWith({
        email: "test@example.com",
      });
      expect(mockHasher.compare).toHaveBeenCalledWith(
        "SecurePass123!",
        "hashed_password_123",
      );
    });

    it("should return error when password is incorrect", async () => {
      const mockUserRecord = {
        email: "test@example.com",
        id: "550e8400-e29b-41d4-a716-446655440001",
        password: "hashed_password_123",
        role: "USER",
        sensitiveData: "",
        username: "testuser",
      };

      mockRepo.login = vi.fn().mockResolvedValue(mockUserRecord);
      mockHasher.compare = vi.fn().mockResolvedValue(false);

      const result = await service.login({
        email: "test@example.com",
        password: "WrongPassword",
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("validation");
      }
    });

    it("should return error when user has no password hash", async () => {
      const mockUserRecord = {
        email: "test@example.com",
        id: "550e8400-e29b-41d4-a716-446655440002",
        password: "",
        role: "USER",
        sensitiveData: "",
        username: "testuser",
      };

      mockRepo.login = vi.fn().mockResolvedValue(mockUserRecord);

      const result = await service.login({
        email: "test@example.com",
        password: "SecurePass123!",
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("validation");
      }
      expect(mockHasher.compare).not.toHaveBeenCalled();
    });
  });
});
