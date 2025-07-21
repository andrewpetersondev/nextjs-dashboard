"use client";

import { type JSX, useActionState, useEffect, useState } from "react";
import { FormActionRow } from "@/components/form-action-row";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Label } from "@/components/label";
import type { CustomerField } from "@/features/customers/customer.types";
import { updateInvoiceAction } from "@/features/invoices/invoice.actions";
import type {
  InvoiceDto,
  InvoiceDtoWithId,
} from "@/features/invoices/invoice.dto";
import { hasInvoiceId } from "@/features/invoices/invoice.type-guards";
import type {
  InvoiceActionResultGeneric,
  InvoiceFieldName,
} from "@/features/invoices/invoice.types";
import { CustomerSelect } from "@/ui/invoices/customer-select";
import { InvoiceAmountInput } from "@/ui/invoices/invoice-amount-input";
import { InvoiceStatusRadioGroup } from "@/ui/invoices/invoice-status-radio-group";
import { ServerMessage } from "@/ui/users/server-message";

export const EditInvoiceForm = ({
  invoice,
  customers,
}: {
  invoice: InvoiceDtoWithId;
  customers: CustomerField[];
}): JSX.Element => {
  // Use the type guard to ensure `invoice.id` is defined
  if (!hasInvoiceId(invoice)) {
    throw new Error("Invoice ID is required for editing");
  }

  // Initial state matches Server Action's expected state
  const initialState: InvoiceActionResultGeneric<
    InvoiceFieldName,
    InvoiceDtoWithId
  > = {
    data: invoice,
    errors: {},
    message: "",
    success: false,
  };

  // Create wrapper action that matches useActionState signature
  const wrappedUpdateAction = async (
    prevState: InvoiceActionResultGeneric<InvoiceFieldName, InvoiceDto>,
    formData: FormData,
  ): Promise<InvoiceActionResultGeneric<InvoiceFieldName, InvoiceDto>> => {
    return await updateInvoiceAction(prevState, invoice.id, formData);
  };

  const [state, action, pending] = useActionState<
    InvoiceActionResultGeneric<InvoiceFieldName, InvoiceDto>,
    FormData
  >(wrappedUpdateAction, initialState);

  // Use the current state data or fall back to the initial invoice
  const currentInvoice = state.data || invoice;

  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (state.message) {
      setShowAlert(true);
      const timer = setTimeout(() => setShowAlert(false), 4000);
      return () => clearTimeout(timer);
    }
    setShowAlert(false);
    return undefined;
  }, [state.message]);

  return (
    <div>
      <form action={action}>
        <div className="rounded-md bg-bg-secondary p-4 md:p-6">
          <div>
            <label htmlFor="start">Start date:</label>
            <input
              id="start"
              max="2029-12-31"
              min="2024-01-01"
              name="trip-start"
              required={true}
              type="date"
              value="2025-07-22"
            />
          </div>

          {/* Sensitive Data */}
          <div className="mb-4">
            <Label htmlFor="sensitiveData" text="Sensitive Data" />
            <input
              aria-label="Sensitive Data"
              autoComplete="off"
              className="w-full rounded border px-3 py-2"
              data-cy="sensitive-data-input"
              defaultValue={currentInvoice.sensitiveData}
              disabled={pending}
              id="sensitiveData"
              name="sensitiveData"
              type="text"
            />
            {state.errors?.sensitiveData && (
              <div className="text-red-600" role="alert">
                {state.errors.sensitiveData.join(", ")}
              </div>
            )}
          </div>

          {/* Customer */}
          <div className="mb-4">
            <Label htmlFor="customer" text="Choose customer" />
            <CustomerSelect
              customers={customers}
              dataCy="customer-select"
              defaultValue={currentInvoice.customerId}
              disabled={pending}
            />
          </div>

          {/* Amount */}
          <InvoiceAmountInput
            dataCy="amount-input"
            defaultValue={currentInvoice.amount / 100}
            disabled={pending}
            error={state.errors?.amount}
            id="amount"
            label="Choose an amount"
            name="amount"
          />

          {/* Invoice Status */}
          <InvoiceStatusRadioGroup
            data-cy="status-radio"
            disabled={pending}
            error={state.errors?.status}
            name="status"
            value={currentInvoice.status}
          />
        </div>

        <FormActionRow cancelHref="/dashboard/invoices">
          <FormSubmitButton
            data-cy="edit-invoice-submit-button"
            pending={pending}
          >
            Edit Invoice
          </FormSubmitButton>
        </FormActionRow>
      </form>
      <ServerMessage showAlert={showAlert} state={state} />
    </div>
  );
};
