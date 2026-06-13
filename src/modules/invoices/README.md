# Invoices Module

The invoices module owns everything about invoices — the dashboard's central
billing record. It covers the full lifecycle (create, edit, delete), the
searchable, paginated invoices table, and the aggregate figures on the dashboard
overview (totals, latest invoices).

It follows the same clean-architecture layering as the rest of `src/modules/**`
(`domain → application → infrastructure → presentation`), but with a **lighter
application layer than `auth`**: a single `InvoiceService` rather than the
CQRS use-cases/workflows split. Where it diverges from the auth module, this
README says so explicitly.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture at a glance](#architecture-at-a-glance)
- [Directory structure](#directory-structure)
- [Key concepts](#key-concepts)
- [Layer responsibilities](#layer-responsibilities)
- [Request flows](#request-flows)
- [Error handling](#error-handling)
- [Conventions & known rough edges](#conventions--known-rough-edges)
- [Related documentation](#related-documentation)

---

## Overview

An invoice is the most data-heavy entity in the app, and the module reflects
that: a small write surface (CRUD) sits alongside a comparatively large **read**
surface that feeds the dashboard. The domain entity is:

```typescript
interface InvoiceEntity {
  readonly amount: number;          // integer cents (never dollars)
  readonly customerId: CustomerId;  // branded; references the customers module
  readonly date: Date;
  readonly id: InvoiceId;           // branded
  readonly revenuePeriod: Period;   // branded; derived from `date` (first-of-month)
  readonly sensitiveData: string;
  readonly status: InvoiceStatus;   // "pending" | "paid"
}
```

---

## Architecture at a glance

Every server action routes through the service — one path shape:

```
Server Action ─▶ InvoiceService ─▶ InvoiceRepository ─▶ DAL ─▶ Postgres
```

Both commands (create / read-by-id / update / delete) and list/aggregate
reads (filtered list, page count, latest, totals/summary) take this path; each
action builds `new InvoiceService(new InvoiceRepository(getAppDb()))` inline.

How invoices differs from the `auth` module — worth knowing up front:

| Concern | `auth` | `invoices` |
|---|---|---|
| Application layer | CQRS: commands / queries / workflows | One `InvoiceService` class with CRUD + read methods |
| Composition | DI composition root + factories | Actions build `new InvoiceService(new InvoiceRepository(getAppDb()))` inline |
| Repo error style | Returns `Result<T, AppError>` | **Throws** `AppError`; caught in the action's `try/catch` |
| Reads | Through query use-cases | Through `InvoiceService` read methods |

Neither approach is "wrong" — invoices is simpler than auth and is wired more
directly. The table is here so the difference doesn't read as an inconsistency.

---

## Directory structure

```
invoices/
├── domain/                              # Framework-agnostic core: types, rules, i18n
│   ├── entities/invoice.entity.ts       #   InvoiceEntity + Service/Form/Partial variants
│   ├── statuses/invoice.statuses.ts     #   INVOICE_STATUSES = ["pending", "paid"]
│   ├── schema/invoice.schema.ts         #   Zod CreateInvoiceSchema + field-name lists
│   ├── types/invoice-id.brand.ts        #   InvoiceId branded type
│   ├── i18n/                            #   invoice-messages.ts, en-invoices.ts, translator.ts
│   ├── invoice-id.factory.ts            #   build / validate an InvoiceId
│   ├── invoice-id.mappers.ts            #   toInvoiceId(string) → InvoiceId
│   ├── invoice-status.validator.ts      #   status guard
│   ├── invoice.codecs.ts               #   domain-level codecs
│   ├── invoice.constants.ts             #   ITEMS_PER_PAGE_INVOICES (10), date regexes
│   ├── invoice.date-utils.ts            #   date helpers
│   └── invoice.types.ts                 #   InvoiceListFilter (invoice joined with customer)
│
├── application/                         # Orchestration / business rules
│   ├── dto/invoice.dto.ts               #   InvoiceDto, InvoiceFormDto, InvoicesSummary
│   ├── services/invoice.service.ts      #   InvoiceService — CRUD + list/aggregate reads, returns Result<…, AppError>
│   └── utils/error-messages.ts          #   toInvoiceErrorMessage()
│
├── infrastructure/                      # Database + data transformation
│   ├── adapters/
│   │   ├── codecs/invoice-codecs.ts     #   DTO ⇄ entity codecs (entityToInvoiceDto, …)
│   │   └── mappers/invoice.mapper.ts    #   form → service entity (derives revenuePeriod)
│   └── repository/
│       ├── base-repository.ts           #   abstract BaseRepository<TDto, TId, TCreate, TUpdate>
│       ├── invoice.repository.ts        #   InvoiceRepository — CRUD + reads; throws AppError
│       └── dal/                         #   one function per query (4 CRUD + 6 dashboard reads)
│
└── presentation/                        # Next.js server actions + React UI
    ├── actions/                         #   9 server actions (commands + reads)
    ├── components/                      #   tables (desktop/mobile/status), latest, skeletons, links
    ├── forms/                           #   create/edit forms + field inputs
    └── constants/invoice-form.constants.ts
```

---

## Key concepts

### Money is stored in cents

The UI works in dollars; the system stores **integer cents**. `InvoiceService`
converts on the way in (`dollarsToCents`, using `CENTS_IN_DOLLAR` from
`@/shared/primitives/money`). `InvoiceDto.amount` is always integer cents — format
to dollars only at the very edge (UI).

### Dates and the revenue period

- `date` is a `Date` in the entity and an ISO `YYYY-MM-DD` string in the DTO.
- `revenuePeriod` is a branded `Period`, **derived from `date`** (the first day of
  its month, transported as `YYYY-MM-01`). It is *not* a form field — the mapper
  computes it server-side, which is why `InvoiceFormEntity` / `InvoiceFormDto`
  omit it.

### Branded IDs

`InvoiceId` (and the cross-module `CustomerId`) are branded types — a raw `string`
won't type-check where an ID is expected. Convert at the boundary with
`toInvoiceId()`.

### The entity / DTO family

| Type | Shape | Used for |
|---|---|---|
| `InvoiceEntity` | full record | the domain truth (includes `id`, `revenuePeriod`) |
| `InvoiceServiceEntity` | `Omit<…, "id">` | service layer before the DB assigns an id |
| `InvoiceFormEntity` | `Omit<…, "id" \| "revenuePeriod">` | a form submission |
| `InvoiceFormPartialEntity` | `Partial<InvoiceFormEntity>` | partial updates |
| `InvoiceDto` | plain, serializable | transport to UI/API (amount in cents) |
| `InvoiceFormDto` | `Omit<InvoiceDto, "id" \| "revenuePeriod">` | form input DTO |
| `InvoicesSummary` | `{ totalInvoices, totalPaid, totalPending }` | the overview cards |
| `InvoiceListFilter` | invoice + joined customer fields | the invoices table rows |

### Validation, forms, and i18n

- Input is validated with a Zod schema (`CreateInvoiceSchema` +
  `CREATE_INVOICE_FIELDS_LIST`) in `domain/schema/invoice.schema.ts`.
- Actions return a `FormResult` (`makeFormOk` / `makeFormError` from
  `@/shared/forms`), with Zod issues mapped to per-field errors.
- User-facing strings come from `INVOICE_MSG` and are rendered through
  `translator()` (`domain/i18n/`); domain/infra errors are mapped to a message via
  `toInvoiceErrorMessage()`.

### Authorization

The three mutations (create / update / delete) call `requireSession()` at the top
of their action, above the `try/catch` — Server Actions are invocable on their
own, so the route middleware isn't enough. The **reads** (filtered list, page
count, latest, totals) are deliberately left unguarded at the action level: they
sit behind the dashboard route gate and are lower-sensitivity. See the auth
module's [authorization guards](../auth/presentation/README.md#authorization-guards)
and [ADR-007](../auth/notes/adr/007-enforce-action-level-authorization.md).

---

## Layer responsibilities

- **domain/** — what an invoice *is* and what's always true of it: entity + its
  variants, the `pending|paid` status, branded `InvoiceId`, the Zod schema, date
  utilities, and the i18n message catalog. No Next.js, no Drizzle.
- **application/** — `InvoiceService` applies business rules (dollars→cents, date
  validation) and orchestrates codecs/mappers and the repository. Returns
  `Result<InvoiceDto, AppError>`.
- **infrastructure/** — `InvoiceRepository` (CRUD) over `BaseRepository`, the
  per-query DAL functions, and the codecs/mappers that translate between DTOs,
  entities, and database rows. This is the only layer that touches the DB.
- **presentation/** — `"use server"` actions that adapt `FormData` ⇄ DTOs and call
  the service or DAL, plus the React table/form/skeleton components.

---

## Request flows

### Create / update / delete (command path)

1. The action parses `FormData` and validates it with the Zod schema.
2. It constructs `new InvoiceService(new InvoiceRepository(getAppDb()))`.
3. `InvoiceService` applies business rules (dollars→cents, date format), runs the
   codec/mapper chain, and calls the repository.
4. `InvoiceRepository` calls the matching DAL function and maps the row back to an
   `InvoiceDto`.
5. The action `revalidatePath(ROUTES.dashboard.invoices)` and returns a
   `FormResult`.

### Lists & aggregates (read path)

`readInvoicesSummaryAction`, `readFilteredInvoicesAction`,
`readInvoicesPagesAction`, and `readLatestInvoicesAction` follow the same path
as the commands: each builds `new InvoiceService(new InvoiceRepository(getAppDb()))`
and calls the matching service read method (`readInvoicesSummary` /
`readFilteredInvoices` / `readInvoicesPages` / `readLatestInvoices`), which the
repository fulfils via its DAL functions. The action unwraps the `Result` into a
plain shape (`InvoicesSummary`, `InvoiceListFilter[]`, …). Page size is
`ITEMS_PER_PAGE_INVOICES` (10).

---

## Error handling

This module uses two styles, and you'll see both in a single action:

- **The service returns `Result`** — its own validation failures come back as
  `Err(AppError)` and are turned into field-level `FormResult` errors.
- **The repository and DAL throw `AppError`** — those propagate up as exceptions
  and are caught by the action's `try/catch`, then mapped with
  `toInvoiceErrorMessage()` and logged.

For when something should be an `AppError` versus a domain outcome, see
[when-to-use-app-error.md](../../../docs/when-to-use-app-error.md) and the
[error-handling flow diagram](../../../docs/diagrams/error-handling-flow.md).

---

## Conventions & known rough edges

Kept honest on purpose — a doc that hides the warts isn't worth much.

- **No automated tests yet.** Unlike `auth` and `users`, this module has no
  `__tests__/`. The service's business rules (cents conversion, date validation,
  partial-update assembly) and the DAL queries are the highest-value things to
  cover first.
- **Composition is inline.** Actions `new` up the service and repository directly
  rather than resolving them from a composition root (as `auth` does). Fine while
  the graph is small; revisit if wiring grows.
- **`sensitiveData` crosses the boundary.** The field flows through to `InvoiceDto`
  and `InvoiceListFilter` unredacted — the opposite of how `auth` strips passwords
  at the domain→application boundary. If it ever holds anything truly sensitive,
  that boundary needs the same treatment.

---

## Related documentation

- [Module layering](../../../docs/diagrams/module-layers.md) — which layer may import which.
- [Database ERD](../../../docs/diagrams/database-erd.md) — the `invoices` table and its relations.
- [Dependency injection](../../../docs/diagrams/dependency-injection.md) — the DI pattern the rest of the app uses.
- [project-structure.md](../../../docs/project-structure.md) — where code belongs across the repo.

---

**Last updated:** 2026-06-09
