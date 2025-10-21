import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUserRepository } from "@/server/auth/infrastructure/ports/auth-user-repository.port";
import type { PasswordHasher } from "@/server/auth/infrastructure/ports/password-hasher.port";
import { AuthUserService } from "../auth-user.service";

describe("AuthUserService", () => {
  let mockRepo: AuthUserRepository;
  let mockHasher: PasswordHasher;
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

    service = new AuthUserService(mockRepo, mockHasher);
  });

  describe("signup", () => {
    it("should successfully create a user with hashed password", async () => {
      const mockHashedPassword = "hashed_password_123";
      const mockUserRecord = {
        email: "test@example.com",
        id: "user-123",
        password: mockHashedPassword,
        role: "USER",
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
        expect(result.error.kind).toBe("missing_fields");
      }
      expect(mockRepo.signup).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("should successfully login with valid credentials", async () => {
      const mockUserRecord = {
        email: "test@example.com",
        id: "user-123",
        password: "hashed_password_123",
        role: "USER",
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
        expect(result.value.id).toBe("user-123");
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
        id: "user-123",
        password: "hashed_password_123",
        role: "USER",
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
        expect(result.error.kind).toBe("invalid_credentials");
      }
    });

    it("should return error when user has no password hash", async () => {
      const mockUserRecord = {
        email: "test@example.com",
        id: "user-123",
        password: "",
        role: "USER",
        username: "testuser",
      };

      mockRepo.login = vi.fn().mockResolvedValue(mockUserRecord);

      const result = await service.login({
        email: "test@example.com",
        password: "SecurePass123!",
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe("invalid_credentials");
      }
      expect(mockHasher.compare).not.toHaveBeenCalled();
    });
  });
});
