# Forms Module Documentation

## Overview

The `forms` folder provides a robust, type-safe foundation for form validation, error handling, and state management across UI and server layers. It leverages TypeScript generics, Zod schemas, and domain-specific types to ensure data integrity and maintainability.

---

## Architecture

- **Type Safety:** All form logic is strictly typed using generics and branded types.
- **Validation:** Uses Zod schemas for runtime validation and normalization.
- **Error Handling:** Errors are mapped to domain-specific field names for precise UI feedback.
- **State Management:** Form state includes errors, messages, success status, and optionally validated data.

---

## Key Files

- `form-validation.ts`: Core validation utilities, error mapping, and normalization.
- `form.types.ts`: TypeScript types for form state, errors, and field-level error representation.
- `README.md`: This documentation.

---

## Type Safety

- All types use generics for field names and data shapes.
- Field names are constrained to string literal unions for domain safety.
- Branded types prevent accidental misuse of IDs and domain values.

---

## Validation Flow

1. **Form Submission:** UI sends `FormData` to server action.
2. **Validation:** `validateFormData()` parses and validates input against a Zod schema.
3. **Error Mapping:** Only allowed field names are included in the error map.
4. **Transformation:** Validated data is sanitized and transformed for DAL/database use.
5. **Error Propagation:** Errors and messages are returned in a consistent, typed shape.

---

## Error Handling

- **Field Errors:** Mapped as `FormErrors<TFieldNames>`, only present for fields with errors.
- **General Errors:** Provided as a message string for display above the form.
- **Success State:** `success: boolean` indicates operation result.

---

## Usage Example

```typescript
import { INVOICE_FIELD_NAMES } from "@/features/invoices/invoice.types";
import { validateFormData } from "@/lib/forms/form-validation";
import { CreateInvoiceSchema } from "@/features/invoices/invoice.types";

const result = validateFormData(
  formData,
  CreateInvoiceSchema,
  INVOICE_FIELD_NAMES,
);

if (!result.success) {
  // Display result.errors and result.message in the UI
}
```

````

---

## Data Flow Diagram

```mermaid
flowchart TD
    A[UI: Form Submission] -->|FormData| B[Server: validateFormData]
    B -->|Validation| C[Error Mapping]
    C -->|Errors| D[UI: Display Errors]
    B -->|Valid Data| E[Transformation & DAL]
```

---

## Accessibility & Internationalization

- Error messages are designed for clear, accessible UI feedback.
- Field-level errors support ARIA attributes and semantic HTML.

---

## Extending & Customizing

- Add new field name unions and schemas for each form domain.
- Use provided types and utilities for consistent error handling and validation.

---

## References

- `form-validation.ts`
- `form.types.ts`
- Zod documentation: https://zod.dev/
- TypeScript documentation: https://www.typescriptlang.org/docs/

---

## Maintainer Notes

- Review and update this documentation as new forms and validation logic are added.
- Ensure all form types and schemas are documented with TSDoc.
````
