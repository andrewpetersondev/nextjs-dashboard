"use client";

import { type JSX, useActionState, useEffect, useState } from "react";
import type { CustomerField } from "@/features/customers/types";
import { CustomerSelect } from "@/features/invoices/components/customer-select";
import { InvoiceAmountInput } from "@/features/invoices/components/invoice-amount-input";
import { InvoiceDate } from "@/features/invoices/components/invoice-date";
import { InvoiceStatusRadioGroup } from "@/features/invoices/components/invoice-status-radio-group";
import { SensitiveData } from "@/features/invoices/components/sensitve-data";
import { ServerMessage } from "@/features/users/components/server-message";
import { updateInvoiceAction } from "@/server/invoices/actions/update";
import type { InvoiceDto } from "@/server/invoices/dto";
import type { InvoiceActionResult } from "@/server/invoices/types";
import { TIMER } from "@/shared/constants/ui";
import { FormActionRow } from "@/ui/form-action-row";
import { FormSubmitButton } from "@/ui/form-submit-button";
import { Label } from "@/ui/label";

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
      const timer = setTimeout(
        () => setShowAlert(false),
        TIMER.ALERT_AUTO_HIDE_MS,
      );
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
            error={
              state.errors?.sensitiveData &&
              state.errors.sensitiveData.length > 0
                ? (state.errors.sensitiveData as unknown as readonly [
                    string,
                    ...string[],
                  ])
                : undefined
            }
          />

          {/* Customer */}
          <div className="mb-4">
            <Label htmlFor="customer" text="Choose customer" />
            <CustomerSelect
              customers={customers}
              dataCy="customer-select"
              defaultValue={currentInvoice.customerId}
              disabled={pending}
              error={
                state.errors?.customerId && state.errors.customerId.length > 0
                  ? (state.errors.customerId as unknown as readonly [
                      string,
                      ...string[],
                    ])
                  : undefined
              }
            />
          </div>

          {/* Amount */}
          <InvoiceAmountInput
            dataCy="amount-input"
            defaultValue={currentInvoice.amount / 100}
            disabled={pending}
            error={
              state.errors?.amount && state.errors.amount.length > 0
                ? (state.errors.amount as unknown as readonly [
                    string,
                    ...string[],
                  ])
                : undefined
            }
            id="amount"
            label="Choose an amount"
            name="amount"
          />

          {/* Invoice Status */}
          <InvoiceStatusRadioGroup
            data-cy="status-radio"
            disabled={pending}
            error={
              state.errors?.status && state.errors.status.length > 0
                ? (state.errors.status as unknown as readonly [
                    string,
                    ...string[],
                  ])
                : undefined
            }
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
