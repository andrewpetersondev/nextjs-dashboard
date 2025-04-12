"use client";

import { CustomerField } from "@/src/lib/definitions";
import Link from "next/link";
import {
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/src/ui/button";
import { createInvoice } from "@/src/server-actions/invoices";
import { useActionState } from "react";
import type { InvoiceState } from "@/src/lib/definitions";

export default function CreateInvoiceForm({
  customers,
}: {
  customers: CustomerField[];
}) {
  const initialState: InvoiceState = { message: null, errors: {} };
  const [state, formAction] = useActionState(createInvoice, initialState);
  return (
    <form action={formAction}>
      {/*<form>*/}
      <div className="rounded-md bg-bg-accent p-4 md:p-6">
        {/* Customer Name */}
        <div className="mb-4">
          <label htmlFor="customer" className="mb-2 block text-sm font-medium">
            Choose customer
          </label>
          <div className="relative">
            <select
              id="customer"
              name="customerId"
              className="peer block w-full cursor-pointer rounded-md border border-s-bg-secondary py-2 pl-10 text-sm outline-2 placeholder:text-text-secondary"
              defaultValue=""
              aria-describedby="customer-error"
            >
              <option value="" disabled>
                Select a customer
              </option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-text-primary" />
          </div>
          <div id="customer-error" aria-live="polite" aria-atomic="true">
            {state.errors?.customerId &&
              state.errors.customerId.map((error: string) => (
                <p className="mt-2 text-sm text-text-error" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Invoice Amount */}
        <div className="mb-4">
          <label htmlFor="amount" className="mb-2 block text-sm font-medium">
            Choose an amount
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                placeholder="Enter USD amount"
                className="peer block w-full rounded-md border border-bg-secondary py-2 pl-10 text-sm outline-2 placeholder:text-text-secondary"
              />
              <CurrencyDollarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-text-primary peer-focus:text-text-focus" />
            </div>
          </div>
        </div>

        {/* Invoice Status */}
        <fieldset>
          <legend className="mb-2 block text-sm font-medium">
            Set the invoice status
          </legend>
          <div className="rounded-md border border-bg-secondary bg-bg-primary px-[14px] py-3">
            <div className="flex gap-4">
              <div className="flex items-center">
                <input
                  id="pending"
                  name="status"
                  type="radio"
                  value="pending"
                  className="h-4 w-4 cursor-pointer border-bg-secondary bg-bg-accent text-text-primary focus:ring-2"
                />
                <label
                  htmlFor="pending"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-bg-accent px-3 py-1.5 text-xs font-medium text-text-primary"
                >
                  Pending <ClockIcon className="h-4 w-4" />
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="paid"
                  name="status"
                  type="radio"
                  value="paid"
                  className="h-4 w-4 cursor-pointer border-bg-secondary bg-bg-accent text-text-primary focus:ring-2"
                />
                <label
                  htmlFor="paid"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-bg-secondary px-3 py-1.5 text-xs font-medium text-text-primary"
                >
                  Paid <CheckIcon className="h-4 w-4" />
                </label>
              </div>
            </div>
          </div>
        </fieldset>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/invoices"
          className="flex h-10 items-center rounded-lg bg-bg-accent px-4 text-sm font-medium text-text-primary transition-colors hover:bg-bg-hover"
        >
          Cancel
        </Link>
        <Button type="submit">Create Invoice</Button>
      </div>
    </form>
  );
}