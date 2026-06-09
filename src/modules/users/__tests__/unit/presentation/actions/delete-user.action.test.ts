import {
	makeUserEntity,
	TEST_USER_ID,
} from "@test-support/fixtures/user.fixtures";
import { runAndCaptureRedirectPath } from "@test-support/next-redirect";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { requireAdmin } from "@/modules/auth/presentation/session/guards/session-access.guard";
import { USER_ERROR_MESSAGES } from "@/modules/users/domain/constants/user.constants";
import { createUserService } from "@/modules/users/infrastructure/factories/user-service.factory";
import { deleteUserAction } from "@/modules/users/presentation/actions/delete-user.action";
import { getAppDb } from "@/server/db/db.connection";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";
import { Err, Ok } from "@/shared/core/result/result";
import { ROUTES } from "@/shared/routing/routes";

vi.mock("@/modules/users/infrastructure/factories/user-service.factory");
vi.mock("@/server/db/db.connection");
vi.mock(
	"@/modules/auth/presentation/session/guards/session-access.guard",
	() => ({
		requireAdmin: vi.fn().mockResolvedValue({
			isAuthorized: true,
			role: "ADMIN",
			userId: "admin-1",
		}),
	}),
);

describe("deleteUserAction", () => {
	// deleteUserAction calls the real `toUserId` mapper, which throws on
	// non-UUID input, so the id under test must be a valid UserId string.
	const validId = String(TEST_USER_ID);

	const mockService = {
		deleteUser: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
		(createUserService as Mock).mockReturnValue(mockService);
		(getAppDb as Mock).mockReturnValue({});
	});

	it("redirects to the users list on success instead of returning a result", async () => {
		mockService.deleteUser.mockResolvedValue(Ok(makeUserEntity()));

		// Regression guard: redirect() now lives outside the try/catch, so its
		// NEXT_REDIRECT control-flow error propagates. Previously the catch
		// swallowed it and returned an "unexpected" FormResult on the success path.
		const redirectedTo = await runAndCaptureRedirectPath(
			deleteUserAction(validId),
		);

		expect(redirectedTo).toBe(ROUTES.dashboard.users);

		const { revalidatePath } = await import("next/cache");
		expect(revalidatePath).toHaveBeenCalledWith(ROUTES.dashboard.users);
	});

	it("returns a not-found error without redirecting when deletion fails", async () => {
		const serviceError = {
			key: APP_ERROR_KEYS.not_found,
			message: "User not found",
		} as unknown as AppError;
		mockService.deleteUser.mockResolvedValue(Err(serviceError));

		const result = await deleteUserAction(validId);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.key).toBe(APP_ERROR_KEYS.not_found);
		}

		const { redirect } = await import("next/navigation");
		expect(redirect).not.toHaveBeenCalled();
	});

	it("returns an unexpected error when the service throws", async () => {
		mockService.deleteUser.mockRejectedValue(new Error("boom"));

		const result = await deleteUserAction(validId);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.key).toBe(APP_ERROR_KEYS.unexpected);
			expect(result.error.message).toBe(USER_ERROR_MESSAGES.unexpected);
		}
	});

	it("enforces admin authorization before deleting", async () => {
		mockService.deleteUser.mockResolvedValue(Ok(makeUserEntity()));

		await runAndCaptureRedirectPath(deleteUserAction(validId));

		expect(requireAdmin).toHaveBeenCalledTimes(1);
	});
});
