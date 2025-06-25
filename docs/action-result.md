# Action Result

TODO: implement

You are correct: you can use a generic, reusable utility like `actionResult` for all your server actions, as long as the return type matches the expected shape (e.g., `ActionResult` or a generic result type).

**However, for maximum type safety and reusability across different forms, a senior developer would:**

- Use a generic type for the result, so you can specify the error field shape per form.
- Document the utility for clarity.
- Ensure the return type is flexible for all forms (users, invoices, etc).

**Here is a production-ready, generic, and documented version:**

```typescript
/**
 * Standardized action result utility for server actions.
 * Supports generic error field mapping for type safety.
 *
 * @template TFields - The shape of form fields for error mapping.
 * @param params - Result parameters.
 * @returns ActionResult<TFields>
 */
export const actionResult = <TFields = unknown>({
  message,
  success = true,
  errors,
}: {
  message: string;
  success?: boolean;
  errors?: Partial<Record<keyof TFields, string[]>>;
}): ActionResult<TFields> => ({
  errors,
  message,
  success,
});
```

**And update your `ActionResult` type to be generic:**

```typescript
/**
 * Generic action result type for server actions.
 * @template TFields - The shape of form fields for error mapping.
 */
export interface ActionResult<TFields = unknown> {
  readonly errors?: Partial<Record<keyof TFields, string[]>>;
  readonly message: string;
  readonly success: boolean;
}
```

**Why:**

- This approach is robust, type-safe, and works for all forms (users, invoices, etc).
- It prevents accidental shape mismatches and improves maintainability.

**Summary:**  
Your approach is correct, but using generics and documentation makes it more robust and future-proof.
