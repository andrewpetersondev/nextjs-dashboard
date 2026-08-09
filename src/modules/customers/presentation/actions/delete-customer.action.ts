"use server";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/modules/auth/presentation/session/session-access.guard";
import { createCustomerId } from "@/modules/customers/domain/customer-id.factory";
import {
	CUSTOMER_ERROR_MESSAGES,
	CUSTOMER_SUCCESS_MESSAGES,
	customerHasInvoicesMessage,
} from "@/modules/customers/domain/messages";
import { createCustomerService } from "@/modules/customers/infrastructure/factories/customer-service.factory";
import { getAppDb } from "@/server/db/db.connection";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";
import type {
	FormResult,
	FormState,
} from "@/shared/forms/core/form-result.dto";
import {
	makeFormError,
	makeFormOk,
} from "@/shared/forms/logic/form-result.factory";
import { ROUTES } from "@/shared/routing/routes";

/**
 * The delete form carries only an id, so every failure is form-level; `_root`
 * is the conventional key for an error with no field to attach to.
 */
function rootFailure(
	key: keyof typeof APP_ERROR_KEYS,
	message: string,
): FormResult<never> {
	return makeFormError<"_root">({
		fieldErrors: { _root: [message] },
		formData: {} as Readonly<Partial<Record<"_root", string>>>,
		formErrors: [],
		key: APP_ERROR_KEYS[key],
		message,
	});
}

/**
 * Deletes a customer, refusing when invoices still reference them.
 *
 * @remarks
 * Deliberately does **not** redirect on success, unlike `deleteUserAction`.
 * The button lives on the customers list, so there is nowhere to go — and a
 * redirect would discard the refusal message on the blocked path, which is the
 * whole reason this action returns state at all. `revalidatePath` refreshes the
 * table in place instead.
 */
export async function deleteCustomerAction(
	_prevState: FormState<unknown>,
	formData: FormData,
): Promise<FormResult<unknown>> {
	await requireSession();

	const rawId = formData.get("id");
	if (typeof rawId !== "string" || !rawId) {
		return rootFailure("validation", CUSTOMER_ERROR_MESSAGES.notFound);
	}

	const idRes = createCustomerId(rawId);
	if (!idRes.ok) {
		return rootFailure("validation", CUSTOMER_ERROR_MESSAGES.notFound);
	}

	try {
		const service = createCustomerService(getAppDb());
		const result = await service.deleteCustomer(idRes.value);

		if (!result.ok) {
			return rootFailure("unexpected", CUSTOMER_ERROR_MESSAGES.deleteFailed);
		}

		const outcome = result.value;

		if (outcome.status === "not-found") {
			return rootFailure("not_found", CUSTOMER_ERROR_MESSAGES.notFound);
		}

		if (outcome.status === "blocked") {
			// A refusal, not a fault: the request was well-formed and the system
			// behaved correctly. `conflict` says "the current state disallows
			// this", which is exactly the situation.
			return rootFailure(
				"conflict",
				customerHasInvoicesMessage(outcome.customer.name, outcome.invoiceCount),
			);
		}

		revalidatePath(ROUTES.dashboard.customers);
		return makeFormOk(
			outcome.customer,
			CUSTOMER_SUCCESS_MESSAGES.deleteSuccess,
		);
	} catch (_error: unknown) {
		return rootFailure("unexpected", CUSTOMER_ERROR_MESSAGES.unexpected);
	}
}
