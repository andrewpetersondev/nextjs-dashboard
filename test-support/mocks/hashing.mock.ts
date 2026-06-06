import { type Mocked, vi } from "vitest";
import type { HashingService } from "@/server/crypto/hashing/hashing.service";

/**
 * A typed mock of the `HashingService` class. The cast is required because the
 * real class has a private field; centralizing it here keeps specs cast-free.
 */
export function makeMockHashingService(): Mocked<HashingService> {
	return {
		compare: vi.fn(),
		hash: vi.fn(),
	} as unknown as Mocked<HashingService>;
}
