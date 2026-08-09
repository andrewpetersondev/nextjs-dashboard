"use client";
import { type JSX, useActionState } from "react";
import type { CustomerDto } from "@/modules/customers/application/dtos/customer.dto";
import { CUSTOMER_FORM_LABELS } from "@/modules/customers/domain/constants";
import { updateCustomerAction } from "@/modules/customers/presentation/actions/update-customer.action";
import {
	type CustomerFieldNames,
	CustomerFormFields,
} from "@/modules/customers/presentation/forms/customer-form-fields";
import type {
	FormResult,
	FormState,
} from "@/shared/forms/core/form-result.dto";
import { extractFieldErrors } from "@/shared/forms/logic/form-error.inspector";
import { ROUTES } from "@/shared/routing/routes";
import { H1 } from "@/ui/atoms/headings.atom";
import { FormActionRow } from "@/ui/forms/components/wrappers/form-action-row";
import { useFormMessage } from "@/ui/forms/hooks/use-form-message";
import { ServerMessageMolecule } from "@/ui/molecules/server-message.molecule";
import { SubmitButtonMolecule } from "@/ui/molecules/submit-button.molecule";

export function EditCustomerForm({
	customer,
}: {
	customer: CustomerDto;
}): JSX.Element {
	// The id is bound server-side rather than sent as a form field, so a
	// submitted payload cannot retarget the update at another customer.
	const updateCustomerWithId = updateCustomerAction.bind(null, customer.id) as (
		prevState: FormState<unknown>,
		formData: FormData,
	) => Promise<FormResult<unknown>>;

	const [state, action, pending] = useActionState<FormState<unknown>, FormData>(
		updateCustomerWithId,
		null,
	);

	const showAlert = useFormMessage(state);

	const fieldErrors =
		state && !state.ok
			? extractFieldErrors<CustomerFieldNames>(state.error)
			: undefined;

	return (
		<div>
			<H1>{CUSTOMER_FORM_LABELS.editHeading}</H1>
			<section>
				<p>Leave a field blank to keep its current value.</p>
			</section>
			<form action={action} autoComplete="off">
				<CustomerFormFields
					defaultValues={{ email: customer.email, name: customer.name }}
					disabled={pending}
					errors={fieldErrors}
					required={false}
				/>
				<FormActionRow
					cancelHref={ROUTES.dashboard.customers}
					cancelLabel={CUSTOMER_FORM_LABELS.cancel}
				>
					<SubmitButtonMolecule
						label={CUSTOMER_FORM_LABELS.save}
						pending={pending}
					/>
				</FormActionRow>
			</form>
			<ServerMessageMolecule showAlert={showAlert} state={state} />
		</div>
	);
}
