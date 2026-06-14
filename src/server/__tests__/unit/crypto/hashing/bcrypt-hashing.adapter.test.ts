import bcryptjs from "bcryptjs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BcryptHashingAdapter } from "@/server/crypto/hashing/bcrypt-hashing.adapter";
import { toHash } from "@/server/crypto/hashing/hashing.value";
import { isAppError } from "@/shared/core/errors/core/app-error.entity";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";

describe("BcryptHashingAdapter", () => {
	const adapter = new BcryptHashingAdapter();

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("hash + compare round-trip (real bcrypt)", () => {
		it("produces a bcrypt hash that is not the raw value", async () => {
			const hash = await adapter.hash("correct horse");

			expect(String(hash)).not.toBe("correct horse");
			// bcrypt hashes start with the "$2" version prefix.
			expect(String(hash).startsWith("$2")).toBe(true);
		});

		it("compares the matching raw value as true and a wrong value as false", async () => {
			const hash = await adapter.hash("correct horse");

			expect(await adapter.compare("correct horse", hash)).toBe(true);
			expect(await adapter.compare("battery staple", hash)).toBe(false);
		});
	});

	describe("error wrapping", () => {
		it("wraps a bcrypt hash failure in an infrastructure AppError", async () => {
			vi.spyOn(bcryptjs, "hash").mockRejectedValue(new Error("boom"));

			try {
				await adapter.hash("x");
				expect.unreachable("hash should have thrown");
			} catch (error) {
				expect(isAppError(error)).toBe(true);
				if (isAppError(error)) {
					expect(error.key).toBe(APP_ERROR_KEYS.infrastructure);
					expect(error.message).toBe("Failed to hash value");
				}
			}
		});

		it("wraps a bcrypt compare failure in an infrastructure AppError", async () => {
			vi.spyOn(bcryptjs, "compare").mockRejectedValue(new Error("boom"));

			try {
				await adapter.compare("x", toHash("$2b$10$whatever"));
				expect.unreachable("compare should have thrown");
			} catch (error) {
				expect(isAppError(error)).toBe(true);
				if (isAppError(error)) {
					expect(error.key).toBe(APP_ERROR_KEYS.infrastructure);
					expect(error.message).toBe("Failed to compare hash");
				}
			}
		});
	});
});
