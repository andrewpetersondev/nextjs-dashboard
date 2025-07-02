"use client";

import { useActionState } from "react";
import type { CustomerField } from "@/src/lib/definitions/customers.ts";
import type { InvoiceFormFields } from "@/src/lib/definitions/invoices.ts";
import type { InvoiceDTO } from "@/src/lib/dto/invoice.dto.ts";
import { updateInvoiceAction } from "@/src/lib/server-actions/invoices.ts";
import { InvoiceForm } from "@/src/ui/invoices/invoice-form.tsx";

type EditInvoiceFormState = Readonly<{
	errors?: Partial<Record<keyof InvoiceFormFields, string[]>>;
	message?: string;
	success?: boolean;
}>;

/**
 * V2 pattern EditInvoiceForm: standalone, doesn't require page reload to show updates.
 */
export function EditInvoiceFormV2({
	invoice,
	customers,
}: {
	invoice: InvoiceDTO;
	customers: CustomerField[];
}) {
	const initialState: EditInvoiceFormState = {
		errors: {},
		message: "",
		success: undefined,
	};
	// Bind updateInvoiceAction to the invoice.id so only formData is left as runtime input
	const updateInvoiceWithId = updateInvoiceAction.bind(null, invoice.id);

	const [state, action, pending] = useActionState<
		EditInvoiceFormState,
		FormData
	>(updateInvoiceWithId, initialState);

	return (
		<InvoiceForm
			action={action}
			cancelHref="/dashboard/invoices"
			customers={customers}
			description="Edit the invoice below."
			initialValues={{
				amount: invoice.amount,
				customerId: invoice.customerId,
				date: invoice.date,
				id: invoice.id,
				status: invoice.status,
			}}
			isEdit={true}
			pending={pending}
			state={state}
			submitLabel="Save Changes"
			title="Edit Invoice"
		/>
	);
}

/**
 * import { useRouter } from "next/navigation";
 * import { useEffect } from "react";
 *
 * // Inside your EditInvoiceFormV2...
 * const router = useRouter();
 * useEffect(() => {
 *   if (state.success) {
 *     router.refresh();
 *   }
 * }, [state.success, router]);
 */
