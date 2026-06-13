# Customers Module

The customers module is **read-only**. It supplies customer data to the rest of
the dashboard — it never creates, updates, or deletes customers (those are
seeded). Concretely, it powers three things:

- the **customers table** (`/dashboard/customers`), with per-customer invoice
  aggregates (total invoices, total paid, total pending);
- the **customer-select dropdown** used by the invoice create/edit forms; and
- the **total customer count**.

It is also the **owner of `CustomerId`** — the branded type the `invoices` module
imports for its `customerId` field.

Because it only reads, it is the lightest data module: **no application/service
layer and no writes**, just `domain → infrastructure → presentation`.

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

The defining feature is a **three-tier data shaping** pipeline — each tier is a
distinct type, and each hop has a clear owner:

```text
Raw DB rows ──(repository)──▶ Server DTOs ──(action)──▶ Formatted UI rows
CustomerAggregatesRowRaw      CustomerAggregatesServerDto   FormattedCustomersTableRow
  totals: number | null         branded id, totals: number    totals: string (currency)
```

- **Raw** (`*RowRaw`) mirrors the exact DB projection; SUM() totals can be `null`.
- **Server DTO** (`*ServerDto`) brands the `id` and normalizes nullable sums to `0`.
- **Formatted row** (`FormattedCustomersTableRow`, `CustomerField`) is the
  feature/UI shape — currency is formatted to a string here, at the action boundary.

---

## Directory structure

```text
customers/
├── domain/                              # Types, branded id, labels, messages
│   ├── types.ts                         #   Raw / ServerDto / Formatted row types (+ CustomerField)
│   ├── types/customer-id.brand.ts       #   CustomerId branded type (owned here; used by invoices)
│   ├── customer-id.factory.ts           #   build a CustomerId
│   ├── customer-id.mappers.ts           #   toCustomerId(raw) → CustomerId
│   ├── mappers.ts                       #   toFormattedCustomersTableRow (server DTO → UI row)
│   ├── constants.ts                     #   CUSTOMER_LABELS, CUSTOMER_TABLE_HEADERS
│   └── messages.ts                      #   CUSTOMER_SERVER_ERROR_MESSAGES
│
├── infrastructure/                      # Database access + raw→DTO mapping
│   ├── repository/customer.repository.ts      #   CustomersRepository + createCustomersRepository(db)
│   ├── repository/dal/                  #   fetch-filtered-customers, fetch-customers-select, fetch-total-count
│   └── adapters/customer.mapper.ts      #   raw row → server DTO (brand id, normalize sums)
│
└── presentation/                        # Next.js server actions + React UI
    ├── actions/                         #   read-filtered-customers, read-customers, read-total-customers-count
    └── components/                      #   customers-table (+ desktop / mobile / row variants)
```

There is intentionally no `application/` layer — without writes or business rules
there is nothing for a service to orchestrate, so actions talk to the repository
directly.

---

## Key concepts

### Read-only by design

The DAL exposes only `fetch*` queries; the repository exposes only `fetchSelect`,
`fetchFiltered`, and `fetchTotalCount`. There is no create/update/delete path.

### Aggregates join the invoices table

`fetchFilteredCustomersDal` left-joins `invoices` to compute, per customer:
`totalInvoices` (a `COUNT`), `totalPaid`, and `totalPending` (filtered `SUM`s by
invoice status). This is the module's one cross-table dependency — it reads the
`invoices` table but not the invoices _module_.

### Composition

`createCustomersRepository(db)` is a small factory; the repository takes an
`AppDatabase` and delegates to the DAL functions, mapping each raw row to a server
DTO with `customer.mapper.ts`.

### Owns `CustomerId`

`CustomerId` is a `Brand<string, …>` defined here. The `invoices` module imports
it for `InvoiceEntity.customerId`, so this module is the source of truth for that
identity.

---

## Request flow

All three actions follow the same read-only shape — for example the table:

1. `readFilteredCustomersAction(query)` opens a db handle and builds the repo with
   `createCustomersRepository(getAppDb())`.
2. `repo.fetchFiltered(query)` runs the DAL query and maps each raw row to a
   `CustomerAggregatesServerDto` (branded id, normalized totals).
3. The action maps those to `FormattedCustomersTableRow[]` with
   `toFormattedCustomersTableRow` — formatting currency at the boundary.

`readCustomersAction` (select options → `CustomerField[]`) and
`readTotalCustomersCountAction` (a `number`) are the same pattern, shorter.

---

## Error handling

The DAL **throws** `makeAppError(APP_ERROR_KEYS.database, …)` on a query failure
(using `CUSTOMER_SERVER_ERROR_MESSAGES`); the error propagates up to the action /
page. This is the same throw-based model as the `invoices` DAL — note it differs
from `users`, which returns `Result` end-to-end. See
[when-to-use-app-error.md](../../../docs/when-to-use-app-error.md).

> No automated tests yet. The mappers (`mapCustomerAggregatesRawToDto`'s null→0
> normalization) and the filtered-aggregate query are the highest-value things to
> cover first.

---

## Related documentation

- [Database ERD](../../../docs/diagrams/database-erd.md) — the `customers` table and its relation to `invoices`.
- [Module layering](../../../docs/diagrams/module-layers.md) — which layer may import which.
- [project-structure.md](../../../docs/project-structure.md) — where code belongs across the repo.
- Sibling module: [`invoices`](../invoices/README.md) — consumes `CustomerId` and shares the aggregate data.

---

**Last updated:** 2026-06-04
