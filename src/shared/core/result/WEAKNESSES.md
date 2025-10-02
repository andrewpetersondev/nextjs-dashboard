Here is a brief analysis of type usage and weaknesses in the referenced files, following the provided TypeScript best
practices:

**General Strengths:**

- All files use strict typing, generics, and discriminated unions for `Result`.
- No use of `any`; generics are used for error types.
- Functions are single-purpose and have explicit return types.

**Weaknesses:**

1. **Unconstrained Generics:**
    - Some generics (e.g., `<T, E>`, `<T, U, E>`) are unconstrained. Best practice is to constrain generics (e.g.,
      `<T extends unknown, E extends unknown>`), especially for public APIs.
    - Constraining generics helps to ensure type safety, improves code readability, and provides clearer expectations
      for consumers of public APIs.
    - It also helps prevent unintended behaviors and enhances maintainability by making the code self-documenting.
    - Consider using generics with specific constraints to ensure better type inference.


2. **Error Type Defaulting:**
    - Many functions default error type to `Error` (e.g., `E = Error`). This is fine for internal/server flows, but for
      public APIs, a serializable error shape is preferred. Consider using a project-wide error DTO for public
      boundaries.
    - Consider defining custom error types for better clarity and maintainability.
    - Consider using generics with specific constraints to ensure better type inference.
    - Ensure to document error shapes used in public APIs for improved clarity.

3. **Nullable Handling:**
    - `fromNullable` uses `v == null` for nullish checks, which is correct, but the error factory is unconstrained.
      Consider constraining `E` or documenting expected error shapes.
    - Consider defining custom error types for better clarity and maintainability.
    -

4. **Type Aliases vs Interfaces:**
    - All object shapes use type aliases. For extensible shapes (e.g., error DTOs), prefer `interface`.
    - Consider using generics with specific constraints to ensure better type inference.

5. **Tuple/Array Inference:**
    - `collectTuple` uses mapped types for tuple inference, which is good, but the error type is inferred as
      `ErrType<T[number]>`, which could be too broad if error types differ. Consider constraining input to tuples of the
      same error type.
    - Ensure to document error shapes used in public APIs for improved clarity.

6. **Unknown Error Mapping:**
    - Error mapping functions accept `unknown`, but there is no runtime narrowing or validation. Consider adding guards
      or type assertions for safer error mapping.
    - Ensure to document error shapes used in public APIs for improved clarity.
    - Consider defining custom error types for better clarity and maintainability.

7. **Immutability:**
    - Most returned objects use `as const` for immutability, which is good. However, input parameters (e.g., arrays) are
      not marked as `readonly`, which could allow mutation.

8. **Type Guards:**
    - Type guards (`isOk`, `isErr`) are present and correct.

**Summary Table:**

| Area               | Weakness                                                              |
|--------------------|-----------------------------------------------------------------------|
| Generics           | Unconstrained in some places; should use `<T extends unknown, ...>`   |
| Error Types        | Default to `Error` for public APIs; prefer serializable DTOs          |
| Immutability       | Returned objects are immutable; input arrays/tuples could be readonly |
| Error Mapping      | Accepts `unknown` but lacks runtime narrowing                         |
| Tuple Error Types  | `collectTuple` error type could be too broad if input errors differ   |
| Object Shape Types | Use `type` for objects; prefer `interface` for extensible shapes      |

**Recommendation:**  
Constrain generics, prefer serializable error types for public APIs, use `readonly` for input collections, and add
runtime guards for error mapping.
