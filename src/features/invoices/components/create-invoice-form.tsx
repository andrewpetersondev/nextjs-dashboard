"use client";

import { type JSX, useActionState, useEffect, useState } from "react";
import type { CustomerField } from "@/features/customers/types";
import { CustomerSelect } from "@/features/invoices/components/customer-select";
import { InvoiceAmountInput } from "@/features/invoices/components/invoice-amount-input";
import { InvoiceDate } from "@/features/invoices/components/invoice-date";
import { InvoiceServerMessage } from "@/features/invoices/components/invoice-server-message";
import { InvoiceStatusRadioGroup } from "@/features/invoices/components/invoice-status-radio-group";
import { SensitiveData } from "@/features/invoices/components/sensitve-data";
import { createInvoiceAction } from "@/server/invoices/actions";
import type { InvoiceActionResult } from "@/server/invoices/types";
import { TIMER } from "@/shared/constants/ui";
import { getCurrentIsoDate } from "@/shared/utils/date";
import { FormActionRow } from "@/ui/form-action-row";
import { FormSubmitButton } from "@/ui/form-submit-button";
import { Label } from "@/ui/label";

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <temp>
export const CreateInvoiceForm = ({
  customers,
}: {
  customers: CustomerField[];
}): JSX.Element => {
  const initialState: InvoiceActionResult = {
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
    <section>
      <form action={action}>
        <div className="rounded-md bg-bg-secondary p-4 md:p-6">
          <InvoiceDate defaultValue={getCurrentIsoDate()} />

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

          <div className="mb-4">
            <Label htmlFor="customer" text="Choose customer" />

            <CustomerSelect
              customers={customers}
              dataCy="customer-select"
              defaultValue=""
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

          <InvoiceAmountInput
            dataCy="amount-input"
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
            placeholder="Enter USD amount"
            step="0.01"
            type="number"
          />

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
