"use server";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/modules/auth/presentation/session/session-access.guard";
import {
	type CreateCustomerData,
	CreateCustomerFormSchema,
	type CustomerWriteFieldNames,
} from "@/modules/customers/domain/customer.schema";
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
 * Creates a customer.
 *
 * Authorization is `requireSession`, not `requireAdmin`: customers are business
 * data like invoices, not account management like users. It is kept above the
 * try/catch so the redirect issued for an anonymous caller is not swallowed by
 * the catch below.
 *
 * Success revalidates but does not redirect, so the form can render its own
 * success message — the convention `createInvoiceAction` documents.
 */
export async function createCustomerAction(
	_prevState: FormState<unknown>,
	formData: FormData,
): Promise<FormResult<unknown>> {
	await requireSession();

	const allowed = resolveCanonicalFieldNames<
		CreateCustomerData,
		CustomerWriteFieldNames
	>(CreateCustomerFormSchema);

	try {
		const validation = await validateForm<
			CreateCustomerData,
			CustomerWriteFieldNames
		>(formData, CreateCustomerFormSchema, allowed, {
			messages: { failureMessage: CUSTOMER_ERROR_MESSAGES.validationFailed },
		});

		if (!validation.ok) {
			return validation;
		}

		const service = createCustomerService(getAppDb());
		const result = await service.createCustomer(validation.value.data);

		if (!result.ok) {
			return customerWriteFailure(
				allowed,
				result.error,
				CUSTOMER_ERROR_MESSAGES.createFailed,
			);
		}

		revalidatePath(ROUTES.dashboard.customers);
		return makeFormOk(result.value, CUSTOMER_SUCCESS_MESSAGES.createSuccess);
	} catch (_error: unknown) {
		return customerFormFailure(
			allowed,
			"unexpected",
			CUSTOMER_ERROR_MESSAGES.unexpected,
		);
	}
}
