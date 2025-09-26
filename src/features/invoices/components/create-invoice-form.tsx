"use client";

import { type JSX, useActionState, useEffect, useState } from "react";
import type { CustomerField } from "@/features/customers/types";
import { CustomerSelect } from "@/features/invoices/components/customer-select";
import { InvoiceAmountInput } from "@/features/invoices/components/invoice-amount-input";
import { InvoiceDate } from "@/features/invoices/components/invoice-date";
import { InvoiceServerMessage } from "@/features/invoices/components/invoice-server-message";
import { InvoiceStatusRadioGroup } from "@/features/invoices/components/invoice-status-radio-group";
import { SensitiveData } from "@/features/invoices/components/sensitve-data";
import {
  type CreateInvoiceFieldNames,
  type CreateInvoiceInput,
  CreateInvoiceSchema,
} from "@/features/invoices/lib/invoice.schema";
import { createInvoiceAction } from "@/server/invoices/actions/create";
import { buildInitialFailureFormStateFromZodSchema } from "@/shared/forms/error-mapping";
import type { FieldError, FormState } from "@/shared/forms/form-types";
import { ALERT_AUTO_HIDE_MS } from "@/shared/ui/tokens/timings";
import { getCurrentIsoDate } from "@/shared/utils/date";
import { Label } from "@/ui/atoms/label";
import { FormActionRow } from "@/ui/forms/form-action-row";
import { FormSubmitButton } from "@/ui/forms/form-submit-button";

const INITIAL_STATE =
  buildInitialFailureFormStateFromZodSchema(CreateInvoiceSchema);

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <its clean>
export const CreateInvoiceForm = ({
  customers,
}: {
  customers: CustomerField[];
}): JSX.Element => {
  const [state, action, pending] = useActionState<
    FormState<CreateInvoiceFieldNames, CreateInvoiceInput>,
    FormData
  >(createInvoiceAction, INITIAL_STATE);

  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (state.message) {
      setShowAlert(true);
      const timer = setTimeout(() => setShowAlert(false), ALERT_AUTO_HIDE_MS);
      return () => clearTimeout(timer);
    }

    setShowAlert(false);
    return;
  }, [state.message]);

  return (
    <section>
      <form action={action}>
        <div className="rounded-md bg-bg-secondary p-4 md:p-6">
          <InvoiceDate
            data-cy="date-input"
            defaultValue={getCurrentIsoDate()}
          />

          <SensitiveData
            data-cy="sensitive-data-input"
            disabled={pending}
            error={state.errors?.sensitiveData as FieldError | undefined}
          />

          <div className="mb-4">
            <Label htmlFor="customer" text="Choose customer" />

            <CustomerSelect
              customers={customers}
              dataCy="customer-select"
              defaultValue=""
              disabled={pending}
              error={state.errors?.customerId as FieldError | undefined}
            />
          </div>

          <InvoiceAmountInput
            dataCy="amount-input"
            disabled={pending}
            error={state.errors?.amount as FieldError | undefined}
            id="amount"
            label="Choose an amount"
            name="amount"
            placeholder="Enter USD amount"
            step="0.01"
            type="number"
          />

          <InvoiceStatusRadioGroup
            data-cy="invoice-status-radio-group"
            disabled={pending}
            error={state.errors?.status as FieldError | undefined}
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
