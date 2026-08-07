import { assertDatabaseEmpty } from "@devtools/seed/seed.guards";
import { nodeDb } from "@devtools/shared/db/node-db";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@devtools/shared/db/node-db", () => ({
	nodeDb: { execute: vi.fn() },
}));

/**
 * Refusal contract for the `db:seed` guard: a non-empty database must THROW so
 * `runCli` exits 1. The guard used to return a boolean that `databaseSeed`
 * turned into a silent early return — `pnpm db:seed` then printed
 * "Database seeded successfully." with exit 0 right after refusing. These
 * tests pin the throw and the reset remedy named in the message.
 */

type ExecuteResult = Awaited<ReturnType<typeof nodeDb.execute>>;

/** The refusal must both say what's wrong and name the reset remedy. */
const REFUSAL_WITH_REMEDY = /not empty[\s\S]*db:reset/;

/** Shape one `SELECT EXISTS(...) AS v` result as the guard's queries return. */
function existsResult(v: boolean): ExecuteResult {
	return { rows: [{ v }] } as unknown as ExecuteResult;
}

describe("assertDatabaseEmpty (db:seed guard)", () => {
	beforeEach(() => {
		vi.mocked(nodeDb.execute).mockReset();
	});

	it("resolves when every seeded table is empty", async () => {
		vi.mocked(nodeDb.execute).mockResolvedValue(existsResult(false));

		await expect(assertDatabaseEmpty()).resolves.toBeUndefined();
		expect(nodeDb.execute).toHaveBeenCalledTimes(4);
	});

	it("throws the db:reset remedy when any seeded table has rows", async () => {
		vi.mocked(nodeDb.execute)
			.mockResolvedValueOnce(existsResult(false))
			.mockResolvedValueOnce(existsResult(true))
			.mockResolvedValue(existsResult(false));

		await expect(assertDatabaseEmpty()).rejects.toThrow(REFUSAL_WITH_REMEDY);
	});
});
