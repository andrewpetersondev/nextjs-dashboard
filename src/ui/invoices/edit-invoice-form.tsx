"use client";

import { type JSX, useActionState, useEffect, useState } from "react";
import { FormActionRow } from "@/components/form-action-row";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Label } from "@/components/label";
import type { CustomerField } from "@/features/customers/customers.types";
import { updateInvoiceAction } from "@/features/invoices/invoice.actions";
import type { InvoiceDto } from "@/features/invoices/invoice.dto";
import type { InvoiceEditState } from "@/features/invoices/invoice.types";
import { CustomerSelect } from "@/ui/invoices/customer-select";
import { InvoiceAmountInput } from "@/ui/invoices/invoice-amount-input";
import { InvoiceStatusRadioGroup } from "@/ui/invoices/invoice-status-radio-group";
import { ServerMessage } from "@/ui/users/server-message";

export const EditInvoiceForm = ({
  invoice,
  customers,
}: {
  invoice: InvoiceDto;
  customers: CustomerField[];
}): JSX.Element => {
  // Initial state matches InvoiceEditState
  const initialState: InvoiceEditState = {
    errors: {},
    invoice,
    message: "",
    success: undefined,
  };

  // Bind the invoice ID to the action
  // I think I used bind while this component was a traditional function, not an arrow function. Is this still needed?
  const updateInvoiceWithId = updateInvoiceAction.bind(null, invoice.id);

  // useActionState expects a reducer: (prevState, payload) => newState
  const [state, formAction, isPending] = useActionState<
    InvoiceEditState,
    FormData
  >(async (prevState, formData) => {
    // Call the server action
    return await updateInvoiceWithId(prevState, formData);
  }, initialState);

  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (state.message) {
      setShowAlert(true);
      const timer = setTimeout(() => setShowAlert(false), 4000);
      return () => clearTimeout(timer);
    }
    setShowAlert(false);
  }, [state.message]);

  return (
    <div>
      <form action={formAction}>
        <div className="rounded-md bg-bg-secondary p-4 md:p-6">
          {/* Customer */}
          <div className="mb-4">
            <Label htmlFor="customer" text="Choose customer" />
            <CustomerSelect
              customers={customers}
              dataCy="customer-select"
              defaultValue={state.invoice.customerId}
              disabled={isPending}
            />
          </div>

          {/* Amount */}
          <InvoiceAmountInput
            dataCy="amount-input"
            defaultValue={state.invoice.amount / 100}
            disabled={isPending}
            error={state.errors?.amount}
            id="amount"
            label="Choose an amount"
            name="amount"
          />

          {/* Invoice Status */}
          <InvoiceStatusRadioGroup
            data-cy="status-radio"
            disabled={isPending}
            error={state.errors?.status}
            name="status"
            value={state.invoice.status}
          />
        </div>

        <FormActionRow cancelHref="/dashboard/invoices">
          <FormSubmitButton
            data-cy="edit-invoice-submit-button"
            pending={isPending}
          >
            Edit Invoice
          </FormSubmitButton>
        </FormActionRow>
      </form>
      <ServerMessage showAlert={showAlert} state={state} />
    </div>
  );
};
