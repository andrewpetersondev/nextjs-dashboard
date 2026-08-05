"use client";
import { type JSX, useActionState, useId } from "react";
import type { CustomerField } from "@/modules/customers/domain/types";
import {
	type EditInvoiceViewModel,
	type UpdateInvoiceFieldNames,
	type UpdateInvoicePayload,
	UpdateInvoiceSchema,
} from "@/modules/invoices/domain/schema/invoice.schema";
import { allowedNextInvoiceStatuses } from "@/modules/invoices/domain/statuses/invoice-status.transitions";
import { updateInvoiceAction } from "@/modules/invoices/presentation/actions/update-invoice.action";
import { INVOICE_FORM_CANCEL_LABEL } from "@/modules/invoices/presentation/constants/invoice-form.constants";
import { CustomerSelect } from "@/modules/invoices/presentation/forms/customer-select";
import { InvoiceAmountInput } from "@/modules/invoices/presentation/forms/invoice-amount-input";
import { InvoiceDate } from "@/modules/invoices/presentation/forms/invoice-date";
import { InvoiceStatusTransitionGroup } from "@/modules/invoices/presentation/forms/invoice-status-transition-group";
import { SensitiveData } from "@/modules/invoices/presentation/forms/sensitive-data";
import type {
	DenseFieldErrorMap,
	FieldError,
} from "@/shared/forms/core/field-error.types";
import type {
	FormResult,
	FormState,
} from "@/shared/forms/core/form-result.dto";
import { makeEmptyDenseFieldErrorMap } from "@/shared/forms/logic/field-error-map.mapper";
import { extractFieldErrors } from "@/shared/forms/logic/form-error.inspector";
import { CENTS_IN_DOLLAR } from "@/shared/primitives/money/money.constants";
import { ROUTES } from "@/shared/routing/routes";
import { FormActionRow } from "@/ui/forms/components/wrappers/form-action-row";
import { useAutoHideAlert } from "@/ui/hooks/useAutoHideAlert";
import { ServerMessageMolecule } from "@/ui/molecules/server-message.molecule";
import { SubmitButtonMolecule } from "@/ui/molecules/submit-button.molecule";

// Dense all-empty map for renders with no submission errors (idle is null).
const EMPTY_ERRORS = makeEmptyDenseFieldErrorMap<
	UpdateInvoiceFieldNames,
	string
>(Object.keys(UpdateInvoiceSchema.shape) as readonly UpdateInvoiceFieldNames[]);

// Helper: build the server action expected by useActionState
function createWrappedUpdateAction(invoiceId: string) {
	return async (
		prevState: FormState<UpdateInvoicePayload>,
		formData: FormData,
	): Promise<FormResult<UpdateInvoicePayload>> =>
		await updateInvoiceAction(prevState, invoiceId, formData);
}

// Presentational: invoice form fields. `locked` = terminal status (paid/void):
// details are frozen, only the lifecycle panel (with no transitions) renders.
function FormFields({
	currentInvoice,
	customers,
	errors,
	locked,
	pending,
}: {
	currentInvoice: EditInvoiceViewModel;
	customers: CustomerField[];
	errors: DenseFieldErrorMap<UpdateInvoiceFieldNames, string>;
	locked: boolean;
	pending: boolean;
}): JSX.Element {
	const invoiceAmountInputId = useId();
	return (
		<div className="space-y-6">
			<InvoiceDate
				data-cy="date-input"
				defaultValue={currentInvoice.date}
				disabled={pending || locked}
			/>

			<SensitiveData
				disabled={pending || locked}
				error={errors.sensitiveData as FieldError | undefined}
			/>

			<CustomerSelect
				customers={customers}
				dataCy="customer-select"
				defaultValue={currentInvoice.customerId}
				disabled={pending || locked}
				error={errors.customerId as FieldError | undefined}
			/>

			<InvoiceAmountInput
				dataCy="amount-input"
				defaultValue={currentInvoice.amount / CENTS_IN_DOLLAR}
				disabled={pending || locked}
				error={errors.amount as FieldError | undefined}
				id={invoiceAmountInputId}
				label="Choose an amount"
				name="amount"
			/>
		</div>
	);
}

// Transitions live in their OWN form so a status change submits ONLY
// {status}. The main form round-trips every field, so a status change could
// otherwise fail validation on unrelated data (as happened when seeded
// amounts exceeded the schema cap — caught by e2e 2026-08-03; the cap/seed
// mismatch itself is fixed, with a seed contract test guarding it). Both
// forms share the same useActionState action, so pending state and server
// feedback stay unified.
function StatusTransitionForm({
	action,
	current,
	pending,
}: {
	action: (formData: FormData) => void;
	current: EditInvoiceViewModel["status"];
	pending: boolean;
}): JSX.Element {
	return (
		<form
			action={action}
			aria-label="Invoice status transitions"
			className="mt-6"
		>
			<InvoiceStatusTransitionGroup current={current} disabled={pending} />
		</form>
	);
}

export const EditInvoiceForm = ({
	invoice,
	customers,
	errors: externalErrors,
}: {
	invoice: EditInvoiceViewModel; // fully populated for UI defaults
	customers: CustomerField[];
	errors?: DenseFieldErrorMap<UpdateInvoiceFieldNames, string>;
}): JSX.Element => {
	const [state, action, pending] = useActionState<
		FormState<UpdateInvoicePayload>,
		FormData
	>(createWrappedUpdateAction(invoice.id), null);
	const currentInvoice: EditInvoiceViewModel =
		state?.ok && state.value.data
			? ({ ...invoice, ...state.value.data } as EditInvoiceViewModel)
			: invoice;

	let message: string | undefined;
	if (state !== null) {
		message = state.ok ? state.value.message : state.error.message;
	}

	const showAlert = useAutoHideAlert(message || "");

	const stateFieldErrors =
		state && !state.ok
			? extractFieldErrors<UpdateInvoiceFieldNames>(state.error)
			: undefined;

	const denseErrors: DenseFieldErrorMap<UpdateInvoiceFieldNames, string> =
		externalErrors ?? stateFieldErrors ?? EMPTY_ERRORS;

	// Terminal statuses have no outgoing transitions — the invoice is a locked
	// record (void-not-delete keeps it for reporting; see the module README).
	const locked = allowedNextInvoiceStatuses(currentInvoice.status).length === 0;

	return (
		<div>
			<form action={action}>
				<FormFields
					currentInvoice={currentInvoice}
					customers={customers}
					errors={denseErrors}
					locked={locked}
					pending={pending}
				/>
				<FormActionRow
					cancelHref={ROUTES.dashboard.invoices}
					cancelLabel={INVOICE_FORM_CANCEL_LABEL}
				>
					{!locked && (
						<SubmitButtonMolecule
							data-cy="edit-invoice-submit-button"
							label="Edit Invoice"
							pending={pending}
						/>
					)}
				</FormActionRow>
			</form>
			<StatusTransitionForm
				action={action}
				current={currentInvoice.status}
				pending={pending}
			/>
			<ServerMessageMolecule showAlert={showAlert} state={state} />
		</div>
	);
};
