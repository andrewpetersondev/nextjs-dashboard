"use client";

import { type JSX, useActionState, useEffect, useState } from "react";
import type { CustomerField } from "@/features/customers/customer.types";
import type { InvoiceDto } from "@/features/invoices/invoice.dto";
import type { InvoiceActionResult } from "@/features/invoices/invoice.types";
import { updateInvoiceAction } from "@/server/actions/invoice.actions";
import { FormActionRow } from "@/ui/components/form-action-row";
import { FormSubmitButton } from "@/ui/components/form-submit-button";
import { Label } from "@/ui/components/label";
import { CustomerSelect } from "@/ui/invoices/customer-select";
import { InvoiceAmountInput } from "@/ui/invoices/invoice-amount-input";
import { InvoiceDate } from "@/ui/invoices/invoice-date";
import { InvoiceStatusRadioGroup } from "@/ui/invoices/invoice-status-radio-group";
import { SensitiveData } from "@/ui/invoices/sensitve-data";
import { ServerMessage } from "@/ui/users/server-message";

export const EditInvoiceForm = ({
  invoice,
  customers,
}: {
  invoice: InvoiceDto;
  customers: CustomerField[];
}): JSX.Element => {
  // Initial state matches Server Action's expected state
  const initialState: InvoiceActionResult = {
    data: invoice,
    errors: {},
    message: "",
    success: false,
  };

  // Create wrapper action that matches useActionState signature
  const wrappedUpdateAction = async (
    prevState: InvoiceActionResult,
    formData: FormData,
  ): Promise<InvoiceActionResult> => {
    return await updateInvoiceAction(prevState, invoice.id, formData);
  };

  const [state, action, pending] = useActionState<
    InvoiceActionResult,
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
          <InvoiceDate defaultValue={currentInvoice.date} />

          <SensitiveData
            disabled={pending}
            error={state.errors?.sensitiveData}
          />

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
