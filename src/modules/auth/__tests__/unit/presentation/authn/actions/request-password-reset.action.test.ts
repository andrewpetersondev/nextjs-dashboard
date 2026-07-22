import { describe, expect, it, vi } from "vitest";
import { requestPasswordResetAction } from "@/modules/auth/presentation/authn/actions/request-password-reset.action";
import { FORGOT_PASSWORD_CONFIRMATION } from "@/modules/auth/presentation/constants/auth.tokens";

vi.mock("@/modules/auth/infrastructure/composition/auth.composition", () => ({
	makeAuthComposition: vi.fn().mockResolvedValue({
		loggers: { action: { operation: vi.fn() } },
		request: { ip: "test-ip" },
	}),
}));

function formDataWithEmail(email: string): FormData {
	const formData = new FormData();
	formData.set("email", email);
	return formData;
}

describe("requestPasswordResetAction", () => {
	it("returns a field error for an invalid email", async () => {
		const result = await requestPasswordResetAction(
			null,
			formDataWithEmail("not-an-email"),
		);

		expect(result.ok).toBe(false);
	});

	it("returns the generic confirmation for a valid email", async () => {
		const result = await requestPasswordResetAction(
			null,
			formDataWithEmail("someone@example.com"),
		);

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.message).toBe(FORGOT_PASSWORD_CONFIRMATION);
			expect(result.value.data).toBeNull();
		}
	});

	// ADR 006 lock: the response must not reveal whether an account exists.
	// The action never looks the user up, so the two results must be
	// structurally identical — if this test starts failing, the endpoint has
	// become an enumeration oracle.
	it("returns an identical response for seeded and unknown emails", async () => {
		const seededAccount = await requestPasswordResetAction(
			null,
			formDataWithEmail("user@user.com"),
		);
		const unknownAccount = await requestPasswordResetAction(
			null,
			formDataWithEmail("no-such-account@example.com"),
		);

		expect(seededAccount).toEqual(unknownAccount);
	});
});
