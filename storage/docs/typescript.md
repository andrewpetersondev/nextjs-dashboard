**Key Points from the Last Message:**

- The error `TS2344: Type CreateUserFormFields does not satisfy the constraint Record<string, unknown>` is due to a mismatch between TypeScript's handling of index signatures in interfaces and the `Record<string, unknown>` constraint.
- `CreateUserFormFields` extends `BaseUserFormFields`, which has an index signature, but TypeScript does not always treat this as satisfying `Record<string, unknown>`.
- To fix, use a type alias with `Record<string, unknown>` or ensure the index signature is present and compatible.
- Best practice: avoid broad index signatures in form field types unless truly needed, for better type safety.

---

**TypeScript Glossary:**

- **Type Alias:** A custom name for a type, e.g., `type User = { name: string }`.
- **Interface:** Describes the shape of an object, e.g., `interface User { name: string }`.
- **Index Signature:** Allows objects to have arbitrary property keys, e.g., `{ [key: string]: unknown }`.
- **Generic:** A type that takes a parameter, e.g., `Array<T>`.
- **Constraint:** Restricts what types can be used as a generic parameter, e.g., `<T extends Record<string, unknown>>`.
- **Omit:** A utility type that removes keys from a type, e.g., `Omit<User, "id">`.
- **Pick:** A utility type that selects keys from a type, e.g., `Pick<User, "name">`.
- **Partial:** Makes all properties optional, e.g., `Partial<User>`.
- **Record:** Constructs a type with a set of properties of a given type, e.g., `Record<string, number>`.
- **Type Inference:** TypeScript's ability to automatically determine the type of a variable or expression.
- **SafeParse:** A Zod method that validates data and returns a result object with `success` and `data` or `error`.
