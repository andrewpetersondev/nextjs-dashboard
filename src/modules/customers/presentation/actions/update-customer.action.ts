"use server";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/modules/auth/presentation/session/session-access.guard";
import type { UpdateCustomerOutcome } from "@/modules/customers/application/services/customer.service";
import {
	type CustomerWriteFieldNames,
	type EditCustomerData,
	EditCustomerFormSchema,
} from "@/modules/customers/domain/customer.schema";
import { createCustomerId } from "@/modules/customers/domain/customer-id.factory";
import {
	CUSTOMER_ERROR_MESSAGES,
	CUSTOMER_SUCCESS_MESSAGES,
} from "@/modules/customers/domain/messages";
import { createCustomerService } from "@/modules/customers/infrastructure/factories/customer-service.factory";
import {
	customerFormFailure,
	customerWriteFailure,
} from "@/modules/customers/presentation/actions/customer-write-failure";
import { getAppDb } from "@/server/db/db.connection";
import type {
	FormResult,
	FormState,
} from "@/shared/forms/core/form-result.dto";
import { makeFormOk } from "@/shared/forms/logic/form-result.factory";
import { resolveCanonicalFieldNames } from "@/shared/forms/logic/zod-schema.inspector";
import { validateForm } from "@/shared/forms/server/validate-form";
import { ROUTES } from "@/shared/routing/routes";

/**
 * Turns a successful use-case outcome into the form's reply.
 *
 * Only the `updated` branch revalidates — an unchanged submission wrote
 * nothing, so busting the customers list cache would be pure waste.
 */
function toUpdateFormResult(
	fields: readonly CustomerWriteFieldNames[],
	outcome: UpdateCustomerOutcome,
): FormResult<unknown> {
	if (outcome.status === "not-found") {
		return customerFormFailure(
			fields,
			"not_found",
			CUSTOMER_ERROR_MESSAGES.notFound,
		);
	}

	if (outcome.status === "unchanged") {
		return makeFormOk(outcome.customer, CUSTOMER_SUCCESS_MESSAGES.noChanges);
	}

	revalidatePath(ROUTES.dashboard.customers);
	return makeFormOk(outcome.customer, CUSTOMER_SUCCESS_MESSAGES.updateSuccess);
}

/**
 * Updates a customer. Blank inputs mean "leave unchanged", so a submission with
 * no edits reports success with a "no changes" message rather than failing.
 */
export async function updateCustomerAction(
	id: string,
	_prevState: FormState<unknown>,
	formData: FormData,
): Promise<FormResult<unknown>> {
	await requireSession();

	const fields = resolveCanonicalFieldNames<
		EditCustomerData,
		CustomerWriteFieldNames
	>(EditCustomerFormSchema);

	const idRes = createCustomerId(id);
	if (!idRes.ok) {
		return customerFormFailure(
			fields,
			"validation",
			CUSTOMER_ERROR_MESSAGES.validationFailed,
		);
	}

	const validated = await validateForm(
		formData,
		EditCustomerFormSchema,
		fields,
		{ messages: { failureMessage: CUSTOMER_ERROR_MESSAGES.validationFailed } },
	);

	if (!validated.ok) {
		return validated;
	}

	try {
		const service = createCustomerService(getAppDb());
		const result = await service.updateCustomer(
			idRes.value,
			validated.value.data,
		);

		if (!result.ok) {
			return customerWriteFailure(
				fields,
				result.error,
				CUSTOMER_ERROR_MESSAGES.updateFailed,
			);
		}

		return toUpdateFormResult(fields, result.value);
	} catch (_error: unknown) {
		return customerFormFailure(
			fields,
			"unexpected",
			CUSTOMER_ERROR_MESSAGES.unexpected,
		);
	}
}
