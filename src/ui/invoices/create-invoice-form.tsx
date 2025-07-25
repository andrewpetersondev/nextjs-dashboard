"use client";

import { type JSX, useActionState, useEffect, useState } from "react";
import { FormActionRow } from "@/components/form-action-row";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Label } from "@/components/label";
import type { CustomerField } from "@/features/customers/customer.types";
import { createInvoiceAction } from "@/features/invoices/invoice.actions";
import type { InvoiceActionResult } from "@/features/invoices/invoice.types";
import { getCurrentIsoDate } from "@/lib/utils/utils";
import { CustomerSelect } from "@/ui/invoices/customer-select";
import { InvoiceAmountInput } from "@/ui/invoices/invoice-amount-input";
import { InvoiceDate } from "@/ui/invoices/invoice-date";
import { InvoiceServerMessage } from "@/ui/invoices/invoice-server-message";
import { InvoiceStatusRadioGroup } from "@/ui/invoices/invoice-status-radio-group";

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
        <InvoiceDate defaultValue={getCurrentIsoDate()} />
        <div className=" my-4 bg-bg-secondary p-4">
          <label className="" htmlFor="date">
            Date
          </label>
          <div className="m-1 flex items-center justify-between rounded-md border-4 border-bg-accent">
            <input
              className="flex-1 justify-between p-2"
              defaultValue={getCurrentIsoDate()}
              id="date"
              max="2029-12-31"
              min="2020-01-01"
              name="date"
              required
              type="date"
            />
          </div>
        </div>

        {/* Sensitive Data */}
        <div className="mb-4">
          <Label htmlFor="sensitiveData" text="Sensitive Data" />
          <input
            aria-label="Sensitive Data"
            autoComplete="off"
            className="w-full rounded border px-3 py-2"
            data-cy="sensitive-data-input"
            defaultValue={"you suck"}
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

        <div className="rounded-md bg-bg-secondary p-4 md:p-6">
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
