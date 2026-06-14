import { describe, expect, it, vi } from "vitest";
import type { HashingContract } from "@/server/crypto/hashing/hashing.contract";
import { createHashingService } from "@/server/crypto/hashing/hashing.factory";
import { HashingService } from "@/server/crypto/hashing/hashing.service";
import { toHash } from "@/server/crypto/hashing/hashing.value";

function makeHasherMock(): HashingContract {
	return {
		compare: vi.fn(),
		hash: vi.fn(),
	};
}

describe("HashingService", () => {
	it("delegates hash() to the port and returns its result", async () => {
		const hasher = makeHasherMock();
		vi.mocked(hasher.hash).mockResolvedValue(toHash("hashed"));
		const service = new HashingService(hasher);

		const result = await service.hash("raw-password");

		expect(hasher.hash).toHaveBeenCalledWith("raw-password");
		expect(String(result)).toBe("hashed");
	});

	it("delegates compare() to the port and returns its boolean result", async () => {
		const hasher = makeHasherMock();
		vi.mocked(hasher.compare).mockResolvedValue(true);
		const service = new HashingService(hasher);
		const stored = toHash("hashed");

		const result = await service.compare("raw-password", stored);

		expect(hasher.compare).toHaveBeenCalledWith("raw-password", stored);
		expect(result).toBe(true);
	});

	it("propagates a false comparison", async () => {
		const hasher = makeHasherMock();
		vi.mocked(hasher.compare).mockResolvedValue(false);
		const service = new HashingService(hasher);

		expect(await service.compare("wrong", toHash("hashed"))).toBe(false);
	});
});

describe("createHashingService", () => {
	it("wires a HashingService backed by the real bcrypt adapter", async () => {
		const service = createHashingService();

		expect(service).toBeInstanceOf(HashingService);

		// Smoke-check the wiring end-to-end (real bcrypt): a hash round-trips.
		const hash = await service.hash("secret");
		expect(String(hash)).not.toBe("secret");
		expect(await service.compare("secret", hash)).toBe(true);
	});
});
