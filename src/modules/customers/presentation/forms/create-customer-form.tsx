"use client";
import { type JSX, useActionState } from "react";
import { CUSTOMER_FORM_LABELS } from "@/modules/customers/domain/constants";
import { createCustomerAction } from "@/modules/customers/presentation/actions/create-customer.action";
import {
	type CustomerFieldNames,
	CustomerFormFields,
} from "@/modules/customers/presentation/forms/customer-form-fields";
import type { FormState } from "@/shared/forms/core/form-result.dto";
import { extractFieldErrors } from "@/shared/forms/logic/form-error.inspector";
import { ROUTES } from "@/shared/routing/routes";
import { H1 } from "@/ui/atoms/headings.atom";
import { FormActionRow } from "@/ui/forms/components/wrappers/form-action-row";
import { useFormMessage } from "@/ui/forms/hooks/use-form-message";
import { ServerMessageMolecule } from "@/ui/molecules/server-message.molecule";
import { SubmitButtonMolecule } from "@/ui/molecules/submit-button.molecule";

export function CreateCustomerForm(): JSX.Element {
	const [state, action, pending] = useActionState<FormState<unknown>, FormData>(
		createCustomerAction,
		null,
	);

	const showAlert = useFormMessage(state);

	const fieldErrors =
		state && !state.ok
			? extractFieldErrors<CustomerFieldNames>(state.error)
			: undefined;

	return (
		<div>
			<H1>{CUSTOMER_FORM_LABELS.createHeading}</H1>
			<section>
				<p>
					New customers start with no invoices and an initials avatar until an
					image is added.
				</p>
			</section>
			<form action={action} autoComplete="off">
				<CustomerFormFields
					disabled={pending}
					errors={fieldErrors}
					required={true}
				/>
				<FormActionRow
					cancelHref={ROUTES.dashboard.customers}
					cancelLabel={CUSTOMER_FORM_LABELS.cancel}
				>
					<SubmitButtonMolecule
						label={CUSTOMER_FORM_LABELS.create}
						pending={pending}
					/>
				</FormActionRow>
			</form>
			<ServerMessageMolecule showAlert={showAlert} state={state} />
		</div>
	);
}
