"use client";

import { type JSX, useActionState, useEffect, useState } from "react";
import { FormActionRow } from "@/components/form-action-row";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Label } from "@/components/label";
import type { CustomerField } from "@/features/customers/customer.types";
import { createInvoiceAction } from "@/features/invoices/invoice.actions";
import type { InvoiceFormStateCreate } from "@/features/invoices/invoice.schemas";
import { CustomerSelect } from "@/ui/invoices/customer-select";
import { InvoiceAmountInput } from "@/ui/invoices/invoice-amount-input";
import { InvoiceServerMessage } from "@/ui/invoices/invoice-server-message";
import { InvoiceStatusRadioGroup } from "@/ui/invoices/invoice-status-radio-group";

export const CreateInvoiceForm = ({
  customers,
}: {
  customers: CustomerField[];
}): JSX.Element => {
  const initialState: InvoiceFormStateCreate = {
    // Omit `data` to satisfy exactOptionalPropertyTypes
    errors: {}, // Valid as Partial<Record<..>>,
    message: "", // No message initially
    success: false, // No success initially
  };
  const [state, action, pending] = useActionState(
    createInvoiceAction,
    initialState,
  );
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (state.message) {
      setShowAlert(true);
      const timer = setTimeout(() => setShowAlert(false), 4000); // 4 seconds
      return () => clearTimeout(timer);
    }
    setShowAlert(false);
    return undefined;
  }, [state.message]);

  return (
    <section>
      <form action={action}>
        {/* DATE */}
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

        <div className="rounded-md bg-bg-secondary p-4 md:p-6">
          <div className="mb-4">
            <Label htmlFor="customer" text="Choose customer" />
            <CustomerSelect
              customers={customers}
              dataCy="customer-select"
              defaultValue=""
              disabled={pending}
              error={state.errors?.customerId}
            />
          </div>
          <InvoiceAmountInput
            dataCy="amount-input"
            disabled={pending}
            error={state.errors?.amount}
            id="amount"
            label="Choose an amount"
            name="amount"
            placeholder="Enter USD amount"
            step="0.01"
            type="number"
          />
          <InvoiceStatusRadioGroup
            data-cy="status-radio"
            disabled={pending}
            error={state.errors?.status}
            name="status"
            value="pending" // Default to "pending"
          />
        </div>
        <FormActionRow cancelHref="/dashboard/invoices">
          <FormSubmitButton
            data-cy="create-invoice-submit-button"
            pending={pending}
          >
            Create Invoice
          </FormSubmitButton>
        </FormActionRow>
      </form>
      <InvoiceServerMessage showAlert={showAlert} state={state} />
    </section>
  );
};
