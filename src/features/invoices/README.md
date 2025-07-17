# Invoice Creation Guide

This document explains the end-to-end process for creating invoices in the project, covering type safety, error handling, form validation, and the separation of concerns across UI, server, and database layers.

---

## Table of Contents

- Overview
- UI Layer
- Server Layer
- Database Layer
- Type Safety
- Error Handling
- Form Validation
- Data Flow Diagram
- File Reference & TSDoc

---

## Overview

Invoice creation is a multi-step process involving:

1. **UI Form Submission**: User fills out and submits the invoice form.
2. **Server Validation & Transformation**: Server validates and transforms the input.
3. **Database Persistence**: Validated data is saved to the database.
4. **Error Handling**: Errors are propagated back to the UI for user feedback.

---

## UI Layer

- **Component**: `CreateInvoiceForm`
- **Type**: Uses `InvoiceFormStateCreate` for form state.
- **Error Display**: Field-level errors are shown next to inputs; general messages are shown above the form.
- **Form Submission**: Uses `useActionState` to call `createInvoiceAction`.

### Example State

```typescript
type InvoiceFormStateCreate = {
  data?: { amount: number; customerId: string; status: "pending" | "paid" };
  errors: Partial<
    Record<"amount" | "customerId" | "status", string[] | undefined>
  >;
  message: string;
  success: boolean;
};
```

---

## Server Layer

- **Action**: `createInvoiceAction`
- **Validation**: Calls `processInvoiceFormData` to validate and transform input.
- **Error Propagation**: Returns errors and messages in the same shape as `InvoiceFormStateCreate`.
- **Type Safety**: All data is strictly typed and branded before database insertion.

### Error Handling

- Validation errors are returned as a map of field names to error arrays.
- Transformation or database errors return a general message and empty error map.

---

## Database Layer

- **DAL Function**: `createInvoiceDal`
- **Type**: Accepts branded types for domain safety.
- **Persistence**: Inserts validated invoice data and returns a DTO for the UI.

---

## Type Safety

- **Types & Interfaces**: All layers use strict TypeScript types and interfaces.
- **Branding**: Domain-specific types (e.g., `CustomerId`, `InvoiceStatus`) prevent accidental misuse.
- **DTOs**: Only plain types are exposed to the UI.

---

## Error Handling

- **Field Errors**: Mapped as `FormErrors<TFieldNames>`, only present for fields with errors.
- **General Errors**: Provided as a message string for display above the form.
- **Success State**: `success: boolean` indicates operation result.

---

## Form Validation

- **Schema**: Uses Zod schemas for runtime validation.
- **Error Mapping**: Only allowed field names are included in error maps.
- **Transformation**: Input is sanitized and converted (e.g., amount to cents, date to ISO string).

---

## Architectural Diagram

```mermaid
flowchart TD
    UI[UI Layer: React Components] -->|FormData| SA[Server Actions]
    SA -->|DTO/Entities| REPO[InvoiceRepository]
    REPO -->|CRUD| DAL[DAL Functions]
    DAL -->|SQL| DB[(Database)]
    DB -->|Raw Rows| DAL
    DAL -->|Entities| MAP[Transformation/Mapping Layer]
    MAP -->|DTOs| REPO
    REPO -->|DTO| SA
    SA -->|FormState| UI
```

---

## Data Flow Diagram New

```mermaid
flowchart TD
    A[UI: CreateInvoiceForm] -->|Submit FormData| B[Server: createInvoiceAction]
    B -->|Validate & Transform| C[Server: processInvoiceFormData]
    C -->|Valid Data| D[Repo: InvoiceRepository]
    D -->|Create| E[DAL: createInvoiceDal]
    E -->|SQL Insert| F[DB: Database]
    F -->|Raw Row| E
    E -->|Raw Row| G[Mapper: toInvoiceEntity/toInvoiceDto]
    G -->|DTO| D
    D -->|DTO| B
    C -->|Validation Errors| B
    B -->|Return FormState| A
```

---

## File Reference & TSDoc

All major files are documented with TSDoc for maintainability and traceability:

- `invoice.actions.ts`: Server actions for CRUD operations.
- `invoice.dal.ts`: Data access layer, handles database logic and error logging.
- `invoice.dto.ts`: Data Transfer Object for safe UI/API transport.
- `invoice.mapper.ts`: Transforms between raw DB rows, domain entities, and DTOs.
- `invoice.branding.ts`: Brands fields for domain safety (compile-time only).
- `invoice.types.ts`: Strict types, constants, and Zod schemas for validation.
- `invoice.utils.ts`: Utility for validating and transforming form data.
- `invoice.entity.ts`: Domain model for invoices with branded types.

All types, interfaces, and functions are documented using TSDoc.  
Refer to each file for details on parameters, return types, error handling, and usage examples.

---

## Summary

- **Type Safety**: Enforced at every layer using TypeScript and branded types.
- **Error Handling**: Consistent error maps and messages for UI feedback.
- **Validation**: Zod schemas and domain logic ensure data integrity.
- **Separation of Concerns**: UI, server, and database logic are clearly separated for maintainability and scalability.
- **Documentation**: All files and types are documented with TSDoc for future contributors.

---

For further details, see the source files:

- `src/ui/invoices/create-invoice-form.tsx`
- `src/features/invoices/invoice.actions.ts`
- `src/features/invoices/invoice.utils.ts`
- `src/features/invoices/invoice.dal.ts`
- `src/lib/forms/form-validation.ts`
- `src/features/invoices/invoice.types.ts`

  ***

## Ideal Structure

Yes, a "tower" diagram is a strong architectural choice for backend data flow. Each layer should only communicate with the layer directly above or below it, passing data up and down. This enforces separation of concerns, makes the flow clear, and simplifies maintenance and testing.

**Characteristics of a Tower Diagram:**

- **Vertical structure:** Each layer (UI, Server Actions, Repository, DAL, Mapper, Database) is stacked.
- **Strict boundaries:** Data only flows between adjacent layers.
- **Bidirectional arrows:** Show both requests and responses.
- **Transformation/validation:** Explicitly shown between layers (e.g., Mapper between DAL and Repository).

**Example (Mermaid):**

```mermaid
flowchart TD
    UI[UI Layer] <--> MAP_UI[UI Mapper]
    MAP_UI <--> SA[Server Actions]
    SA <--> REPO[Repository]
    REPO <--> DAL[DAL]
    DAL <--> MAP_DB[DB Mapper]
    MAP_DB <--> DB[(Database)]
```

This structure makes it easy to trace data, enforce contracts, and extend the system. Each layer is responsible for its own logic and only interacts with its immediate neighbors.
