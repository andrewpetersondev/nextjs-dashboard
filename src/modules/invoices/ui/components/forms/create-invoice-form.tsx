"use client";

import { type JSX, useActionState, useEffect, useId, useRef } from "react";
import type { CustomerField } from "@/modules/customers/domain/types";
import { getCurrentIsoDate } from "@/modules/invoices/domain/invoice.date-utils";
import {
  type CreateInvoiceFieldNames,
  type CreateInvoicePayload,
  CreateInvoiceSchema,
} from "@/modules/invoices/domain/schema/invoice.schema";
import { createInvoiceAction } from "@/modules/invoices/server/application/actions/create-invoice.action";
import { CustomerSelect } from "@/modules/invoices/ui/components/forms/customer-select";
import { InvoiceAmountInput } from "@/modules/invoices/ui/components/forms/invoice-amount-input";
import { InvoiceDate } from "@/modules/invoices/ui/components/forms/invoice-date";
import { InvoiceStatusRadioGroup } from "@/modules/invoices/ui/components/forms/invoice-status-radio-group";
import { SensitiveData } from "@/modules/invoices/ui/components/forms/sensitive-data";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import { makeInitialFormState } from "@/shared/forms/logic/factories/form-state.factory";
import { extractFieldErrors } from "@/shared/forms/logic/inspectors/form-error.inspector";
import { FormActionRow } from "@/shared/forms/ui/components/form-action-row";
import { useFormMessage } from "@/shared/forms/ui/hooks/use-form-message";
import { ROUTES } from "@/shared/routes/routes";
import { H1 } from "@/ui/atoms/headings";
import { ServerMessage } from "@/ui/molecules/server-message";
import { SubmitButtonMolecule } from "@/ui/molecules/submit-button.molecule";

const INITIAL_STATE = makeInitialFormState<CreateInvoiceFieldNames>(
  Object.keys(CreateInvoiceSchema.shape) as readonly CreateInvoiceFieldNames[],
);

function CreateInvoiceFormFields({
  customers,
  disabled = false,
  errors,
}: {
  customers: CustomerField[];
  disabled?: boolean;
  errors?: Partial<Record<CreateInvoiceFieldNames, readonly string[]>>;
}): JSX.Element {
  const amountId = useId();
  const dateId = useId();

  return (
    <>
      <InvoiceDate
        data-cy="date-input"
        defaultValue={getCurrentIsoDate()}
        disabled={disabled}
        id={dateId}
        name="date"
      />

      <SensitiveData
        data-cy="sensitive-data-input"
        disabled={disabled}
        error={
          errors?.sensitiveData as readonly [string, ...string[]] | undefined
        }
      />

      <CustomerSelect
        customers={customers}
        dataCy="customer-select"
        defaultValue=""
        disabled={disabled}
        error={errors?.customerId as readonly [string, ...string[]] | undefined}
      />

      <InvoiceAmountInput
        dataCy="amount-input"
        disabled={disabled}
        error={errors?.amount as readonly [string, ...string[]] | undefined}
        id={amountId}
        label="Choose an amount"
        name="amount"
        placeholder="Enter USD amount"
        step="0.01"
        type="number"
      />

      <InvoiceStatusRadioGroup
        data-cy="invoice-status-radio-group"
        disabled={disabled}
        error={errors?.status as readonly [string, ...string[]] | undefined}
        name="status"
        value="pending"
      />
    </>
  );
}

export function CreateInvoiceForm({
  customers,
}: {
  customers: CustomerField[];
}): JSX.Element {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<
    FormResult<CreateInvoicePayload>,
    FormData
  >(createInvoiceAction, INITIAL_STATE);

  const showAlert = useFormMessage(state);

  // Reset form on success
  useEffect(() => {
    if (state.ok && formRef.current) {
      formRef.current.reset();
    }
  }, [state.ok]);

  const fieldErrors = state.ok
    ? undefined
    : extractFieldErrors<CreateInvoiceFieldNames>(state.error);

  return (
    <div>
      <H1>Create Invoice</H1>
      <section>
        <p>Create a new invoice for a customer.</p>
      </section>
      <form action={action} ref={formRef}>
        <div className="space-y-6">
          <CreateInvoiceFormFields
            customers={customers}
            disabled={pending}
            errors={fieldErrors}
          />
        </div>

        <FormActionRow cancelHref={ROUTES.dashboard.invoices}>
          <SubmitButtonMolecule
            data-cy="create-invoice-submit-button"
            label="Create Invoice"
            pending={pending}
          />
        </FormActionRow>
      </form>
      <ServerMessage showAlert={showAlert} state={state} />
    </div>
  );
}
