"use client";

import { type JSX, useActionState, useEffect, useState } from "react";
import { FormActionRow } from "@/components/form-action-row";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Label } from "@/components/label";
import type { CustomerField } from "@/features/customers/customer.types";
import { createInvoiceAction } from "@/features/invoices/invoice.actions";
import type { InvoiceActionResult } from "@/features/invoices/invoice.types";
import { getCurrentIsoDate } from "@/lib/utils/date.utils";
import { CustomerSelect } from "@/ui/invoices/customer-select";
import { InvoiceAmountInput } from "@/ui/invoices/invoice-amount-input";
import { InvoiceDate } from "@/ui/invoices/invoice-date";
import { InvoiceServerMessage } from "@/ui/invoices/invoice-server-message";
import { InvoiceStatusRadioGroup } from "@/ui/invoices/invoice-status-radio-group";
import { SensitiveData } from "@/ui/invoices/sensitve-data";

export const CreateInvoiceForm = ({
  customers,
}: {
  customers: CustomerField[];
}): JSX.Element => {
  // Use the same type as the server action expects
  const initialState: InvoiceActionResult = {
    // Omit data property to satisfy exactOptionalPropertyTypes
    errors: {},
    message: "",
    success: false,
  };
  const [state, action, pending] = useActionState<
    InvoiceActionResult,
    FormData
  >(createInvoiceAction, initialState);

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
    <section>
      <form action={action}>
        <div className="rounded-md bg-bg-secondary p-4 md:p-6">
          <InvoiceDate defaultValue={getCurrentIsoDate()} />

          <SensitiveData
            disabled={pending}
            error={state.errors?.sensitiveData}
          />

          <div className="mb-4">
            <Label htmlFor="customer" text="Choose customer" />
            <CustomerSelect
              customers={customers}
              dataCy="customer-select"
              defaultValue=""
              disabled={pending}
              error={state.errors?.customerId}
              // Ensure SelectMenu uses name="customerId" and value is a UUID string
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
            value="pending"
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
