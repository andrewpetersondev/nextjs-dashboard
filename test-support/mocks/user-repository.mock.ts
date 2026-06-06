import { type Mocked, vi } from "vitest";
import type { UserRepositoryContract } from "@/modules/users/application/contracts/user-repository.contract";

/**
 * A fully-typed mock of `UserRepositoryContract`.
 *
 * The single `as unknown as Mocked<…>` cast lives here so that test files never
 * need their own `as any`: the returned object exposes typed `.mockResolvedValue`
 * etc. for every method.
 */
export function makeMockUserRepository(): Mocked<UserRepositoryContract> {
	return {
		create: vi.fn(),
		delete: vi.fn(),
		readById: vi.fn(),
		readFilteredUsers: vi.fn(),
		readPageCount: vi.fn(),
		update: vi.fn(),
		withTransaction: vi.fn(),
	} as unknown as Mocked<UserRepositoryContract>;
}
