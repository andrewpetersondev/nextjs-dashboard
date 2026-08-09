# Customers Module

The customers module owns customer data for the dashboard: the customers table,
the customer-select dropdown the invoice forms use, the total customer count,
and — since 2026-08-09 — **create, edit, and delete**.

It is also the **owner of `CustomerId`** — the branded type the `invoices` module
imports for its `customerId` field.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Directory structure](#directory-structure)
- [Key concepts](#key-concepts)
- [Request flow](#request-flow)
- [Error handling](#error-handling)
- [Related documentation](#related-documentation)

---

## Overview

The defining feature of the **read** path is a **three-tier data shaping**
pipeline — each tier is a distinct type, and each hop has a clear owner:

```text
Raw DB rows ──(repository)──▶ Server DTOs ──(action)──▶ Formatted UI rows
CustomerAggregatesRowRaw      CustomerAggregatesServerDto   FormattedCustomersTableRow
  totals: number | null         branded id, totals: number    totals: string (currency)
```

- **Raw** (`*RowRaw`) mirrors the exact DB projection; SUM() totals can be `null`.
- **Server DTO** (`*ServerDto`) brands the `id` and normalizes nullable sums to `0`.
- **Formatted row** (`FormattedCustomersTableRow`, `CustomerField`) is the
  feature/UI shape — currency is formatted to a string here, at the action boundary.

The **write** path is separate and shorter: `CustomerEntity` → `CustomerDto`,
orchestrated by `CustomerService`.

---

## Directory structure

```text
customers/
├── domain/                              # Types, branded id, labels, messages, policy
│   ├── types.ts                         #   Raw / ServerDto / Formatted row types, CustomerEntity
│   ├── types/customer-id.brand.ts       #   CustomerId branded type (owned here; used by invoices)
│   ├── customer-id.factory.ts           #   build a CustomerId (Result-returning)
│   ├── customer-id.mappers.ts           #   toCustomerId(raw) → CustomerId (throwing adapter)
│   ├── customer.schema.ts               #   Create/Edit Zod form schemas + field-name type
│   ├── customer-policy.ts               #   name bounds, normalization, CUSTOMER_IMAGE_URL_NONE
│   ├── customer-deletion.policy.ts      #   evaluateCustomerDeletion — the delete guard's decision
│   ├── customer-initials.ts             #   toCustomerInitials for the fallback avatar
│   ├── mappers.ts                       #   toFormattedCustomersTableRow (server DTO → UI row)
│   ├── constants.ts                     #   CUSTOMER_LABELS, TABLE_HEADERS, FORM_LABELS
│   └── messages.ts                      #   server / feature messages + customerHasInvoicesMessage
│
├── application/                         # Use cases (writes only)
│   ├── contracts/customer-repository.contract.ts  #  the port CustomerService depends on
│   ├── services/customer.service.ts     #   create / read / update / delete + the delete guard
│   ├── dtos/customer.dto.ts             #   CustomerDto — the presentation boundary shape
│   └── mappers/to-customer-dto.mapper.ts
│
├── infrastructure/                      # Database access + raw→DTO mapping
│   ├── repository/customer.repository.ts      #   CustomersRepository + createCustomersRepository(db)
│   ├── repository/dal/                  #   fetch-* (reads) + create/read/update/delete/count (writes)
│   ├── factories/customer-service.factory.ts
│   └── adapters/customer.mapper.ts      #   raw row → server DTO / entity
│
├── presentation/                        # Next.js server actions + React UI
│   ├── actions/                         #   read-*, create, update, delete, read-by-id
│   ├── components/                      #   customers-table (+ desktop / mobile), avatar, action buttons
│   └── forms/                           #   create / edit forms + shared field set
│
└── __tests__/unit/                      # Vitest unit tests
    ├── domain/                          #   id mappers, row mapper, schema, initials, delete policy, messages
    ├── application/                     #   CustomerService — delete guard, patch diffing
    └── infrastructure/adapters/         #   customer.mapper (raw → DTO, null→0)
```

---

## Key concepts

### Deleting a customer is guarded, because the FK cascades

`invoices.customer_id` is declared **`ON DELETE CASCADE`**. Postgres will delete
a customer's invoices as a side effect of deleting the customer — silently, and
in a way that shifts the dashboard's revenue aggregates with no explanation.

So `CustomerService.deleteCustomer` **counts invoices first and refuses** when
the count is non-zero, returning a `blocked` outcome carrying the count so the
UI can name it ("Cannot delete Amy Burns — 10 invoices reference this
customer."). The decision itself is a pure function,
`evaluateCustomerDeletion`, so its boundary is pinned by unit tests rather than
buried in the I/O path — the same shape as `classifyFreshness` in devtools.

> **Known limitation.** This is a check-then-act sequence, so an invoice created
> between the count and the delete would still be cascaded away. Closing that
> window needs a transaction or an `ON DELETE RESTRICT` constraint. At this
> app's concurrency the guard is the demo-facing safeguard; the schema change is
> the durable fix.

`deleteCustomerDal` is unconditional and must never be called from an action
directly — always go through the service.

### A blocked delete is an outcome, not an error

`deleteCustomer` returns `Result<DeleteCustomerOutcome, AppError>`, where the
outcome is `deleted | blocked | not-found`. A refusal is an expected state of
the world, so it is a **value**; `Err` stays reserved for technical failure.
Collapsing the two would leave the action unable to tell "the database is down"
from "this customer has invoices". See
[error-handling-and-result-pattern.md](../../../docs/standards/error-handling-and-result-pattern.md)
under Failure Classification.

### Avatars are local files, so new customers get initials

`next/image` is configured with **no `remotePatterns`**, so it can only serve
files under `public/` — the six seeded avatars. A customer created through the
app therefore has no image: the create form has no image field at all, the
column is written as `CUSTOMER_IMAGE_URL_NONE` (the empty string), and
`CustomerAvatar` renders an initials tile instead. The tile reuses existing
semantic tokens rather than generating a per-customer color, so its contrast
cannot regress the blocking axe checks.

### Email is unique, and the conflict is attributed to the field

`customers.email` carries the table's only unique constraint. `executeDalResult`
routes write failures through `normalizePgError`, which maps Postgres `23505` to
an `AppError` keyed `conflict` — which is why `customerWriteFailure` can put
"A customer with this email address already exists." on the email field rather
than reporting a generic error.

### Aggregates join the invoices table

`fetchFilteredCustomersDal` left-joins `invoices` to compute, per customer:
`totalInvoices` (a `COUNT`), `totalPaid`, and `totalPending` (filtered `SUM`s by
invoice status). `countCustomerInvoicesDal` reads the same table for the delete
guard. This is the module's one cross-table dependency — it reads the `invoices`
table but not the invoices _module_.

### Authorization is `requireSession`, not `requireAdmin`

Customers are business data like invoices, not account management like users, so
every write action guards with `requireSession` — matching the invoice write
actions. A non-admin signed-in user can manage customers.

### Owns `CustomerId`

`CustomerId` is a `Brand<string, …>` defined here. The `invoices` module imports
it for `InvoiceEntity.customerId`, so this module is the source of truth for that
identity.

---

## Request flow

**Read** (the table):

1. `readFilteredCustomersAction(query)` builds the repo with
   `createCustomersRepository(getAppDb())`.
2. `repo.fetchFiltered(query)` runs the DAL query and maps each raw row to a
   `CustomerAggregatesServerDto` (branded id, normalized totals).
3. The action maps those to `FormattedCustomersTableRow[]` with
   `toFormattedCustomersTableRow` — formatting currency at the boundary.

**Write** (delete, the most involved):

1. `deleteCustomerAction(prevState, formData)` guards with `requireSession`,
   reads the id from the form, and brands it with `createCustomerId`.
2. `CustomerService.deleteCustomer` reads the customer (so a refusal can name
   them), counts their invoices, and asks `evaluateCustomerDeletion`.
3. Blocked → `{ status: "blocked", invoiceCount }`; allowed → `repo.delete`.
4. The action turns a `blocked` outcome into a `conflict` form failure carrying
   `customerHasInvoicesMessage`, and a success into `revalidatePath` + `makeFormOk`.

Unlike `deleteUserAction`, this one **does not redirect** — the button lives on
the customers list, and a redirect would discard the refusal message. The single
`useActionState` lives in `CustomersTable`, so all rows share one `role="alert"`
region rather than mounting one per customer.

---

## Error handling

**The read and write halves report failure differently, and the split is
inherited rather than chosen.**

- **Writes** return `Result<T, AppError>` via `executeDalResult`, as
  [the standard requires](../../../docs/standards/error-handling-and-result-pattern.md)
  ("Infrastructure: return `Result`. Never throw for expected DB failures").
- **Reads** predate that rule and **throw** `makeAppError(APP_ERROR_KEYS.database, …)`
  using `CUSTOMER_SERVER_ERROR_MESSAGES`; the error propagates to the action or
  page. `fetch-total-count` is a further exception — it does not catch query
  errors at all and only throws, with the `validation` key, when the count comes
  back missing.

Converting the read half is a separate change: those functions have their own
callers and their own tests.

> **Tests:** unit suites cover the domain mappers, the schema (normalization,
> blank-means-unchanged), the initials fallback, the delete decision, the
> refusal message, the infra adapter, and `CustomerService` (that a blocked
> delete never reaches `repo.delete`). The filtered-aggregate DAL query is still
> uncovered — it needs a DB and is the highest-value thing to add next.

---

## Related documentation

- [Database ERD](../../../docs/diagrams/database-erd.md) — the `customers` table and its relation to `invoices`.
- [Module layering](../../../docs/diagrams/module-layers.md) — which layer may import which.
- [project-structure.md](../../../docs/project-structure.md) — where code belongs across the repo.
- Sibling module: [`invoices`](../invoices/README.md) — consumes `CustomerId` and shares the aggregate data.

---

**Last updated:** 2026-08-09
