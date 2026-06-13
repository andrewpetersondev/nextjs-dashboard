import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import type { SessionVerificationDto } from "@/modules/auth/application/session/dtos/responses/session-verification.dto";
import {
	requireAdmin,
	requireSession,
} from "@/modules/auth/presentation/session/session-access.guard";
import { verifySessionOptimistic } from "@/modules/auth/presentation/session/verify-session-optimistic.action";
import {
	ADMIN_ROLE,
	USER_ROLE,
} from "@/shared/policies/user-role/user-role.constants";
import { ROUTES } from "@/shared/routing/routes";

// `next/navigation` is globally mocked in vitest.setup.ts so that `redirect`
// throws a NEXT_REDIRECT error (mirroring real Next.js). Only the session check
// the guards delegate to needs a local mock here.
vi.mock(
	"@/modules/auth/presentation/session/verify-session-optimistic.action",
	() => ({ verifySessionOptimistic: vi.fn() }),
);

const adminSession: SessionVerificationDto = {
	isAuthorized: true,
	role: ADMIN_ROLE,
	userId: "admin-1",
};

const userSession: SessionVerificationDto = {
	isAuthorized: true,
	role: USER_ROLE,
	userId: "user-1",
};

describe("session-access guards", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("requireSession", () => {
		it("returns the verified session principal", async () => {
			(verifySessionOptimistic as Mock).mockResolvedValue(userSession);

			await expect(requireSession()).resolves.toEqual(userSession);
			expect(redirect).not.toHaveBeenCalled();
		});
	});

	describe("requireAdmin", () => {
		it("returns the session when the caller is an admin", async () => {
			(verifySessionOptimistic as Mock).mockResolvedValue(adminSession);

			await expect(requireAdmin()).resolves.toEqual(adminSession);
			expect(redirect).not.toHaveBeenCalled();
		});

		it("redirects to the dashboard root when the caller is not an admin", async () => {
			(verifySessionOptimistic as Mock).mockResolvedValue(userSession);

			await expect(requireAdmin()).rejects.toThrow("NEXT_REDIRECT");
			expect(redirect).toHaveBeenCalledWith(ROUTES.dashboard.root);
		});

		it("propagates the login redirect raised when there is no session", async () => {
			// verifySessionOptimistic redirects to login on no session; that
			// control-flow error must bubble straight through requireAdmin.
			(verifySessionOptimistic as Mock).mockRejectedValue(
				new Error("NEXT_REDIRECT"),
			);

			await expect(requireAdmin()).rejects.toThrow("NEXT_REDIRECT");
			expect(redirect).not.toHaveBeenCalled();
		});
	});
});
