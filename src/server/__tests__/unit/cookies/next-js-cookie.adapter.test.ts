import { cookies } from "next/headers";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextJsCookieAdapter } from "@/server/cookies/next-js-cookie.adapter";

/**
 * `next/headers` is mocked globally in `vitest.setup.ts`; `cookies()` resolves
 * to a shared store of vi.fn()s. These tests assert the adapter awaits that
 * store and forwards each operation correctly.
 */
describe("NextJsCookieAdapter", () => {
	const adapter = new NextJsCookieAdapter();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns the cookie value when present", async () => {
		const store = await cookies();
		vi.mocked(store.get).mockReturnValue({ name: "session", value: "tok" });

		expect(await adapter.get("session")).toBe("tok");
		expect(store.get).toHaveBeenCalledWith("session");
	});

	it("returns undefined when the cookie is absent", async () => {
		const store = await cookies();
		vi.mocked(store.get).mockReturnValue(undefined);

		expect(await adapter.get("missing")).toBeUndefined();
	});

	it("forwards set() with name, value, and options to the store", async () => {
		const store = await cookies();
		const options = { httpOnly: true };

		await adapter.set("session", "tok", options);

		expect(store.set).toHaveBeenCalledWith("session", "tok", options);
	});

	it("forwards delete() to the store", async () => {
		const store = await cookies();

		await adapter.delete("session");

		expect(store.delete).toHaveBeenCalledWith("session");
	});
});
