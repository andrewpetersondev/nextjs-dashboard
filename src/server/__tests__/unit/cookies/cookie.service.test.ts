import { describe, expect, it, vi } from "vitest";
import type { CookieContract } from "@/server/cookies/cookie.contract";
import { createCookieService } from "@/server/cookies/cookie.factory";
import { CookieService } from "@/server/cookies/cookie.service";

function makeAdapterMock(): CookieContract {
	return {
		delete: vi.fn(),
		get: vi.fn(),
		set: vi.fn(),
	};
}

describe("CookieService", () => {
	it("delegates get() to the adapter and returns its value", async () => {
		const adapter = makeAdapterMock();
		vi.mocked(adapter.get).mockResolvedValue("session-token");
		const service = new CookieService(adapter);

		const value = await service.get("session");

		expect(adapter.get).toHaveBeenCalledWith("session");
		expect(value).toBe("session-token");
	});

	it("forwards set() with the provided options", async () => {
		const adapter = makeAdapterMock();
		const service = new CookieService(adapter);
		const options = { httpOnly: true, path: "/" };

		await service.set("session", "abc", options);

		expect(adapter.set).toHaveBeenCalledWith("session", "abc", options);
	});

	it("defaults set() options to an empty object when omitted", async () => {
		const adapter = makeAdapterMock();
		const service = new CookieService(adapter);

		await service.set("session", "abc");

		expect(adapter.set).toHaveBeenCalledWith("session", "abc", {});
	});

	it("delegates delete() to the adapter", async () => {
		const adapter = makeAdapterMock();
		const service = new CookieService(adapter);

		await service.delete("session");

		expect(adapter.delete).toHaveBeenCalledWith("session");
	});
});

describe("createCookieService", () => {
	it("returns a CookieService instance", () => {
		expect(createCookieService()).toBeInstanceOf(CookieService);
	});
});
