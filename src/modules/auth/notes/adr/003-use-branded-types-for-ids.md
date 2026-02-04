# ADR 003: Use Branded Types for IDs

## Status

Accepted

## Context

In a large application, using raw `string` or `number` types for different kinds of identifiers (UserId, SessionId,
InvoiceId, etc.) is error-prone. It's easy to accidentally pass an `InvoiceId` to a function expecting a `UserId`, and
the TypeScript compiler will not catch this if both are just strings.

## Decision

We will use "Branded Types" (also known as opaque types or flavored types) for all domain identifiers.

- Branded types are created by intersecting a base type (e.g., `string`) with a unique tag.
- Example: `export type UserId = string & { readonly __brand: "UserId" };`
- These types are defined in a central location (`src/shared/branding/brands.ts`).
- Type assertions (`as UserId`) should be used only at the boundaries (e.g., in mappers when converting from a database
  row).

## Consequences

### Positive

- **Type Safety**: Prevents accidental mixing of different identifier types.
- **Self-Documentation**: Function signatures become much clearer (e.g., `findUser(id: UserId)` instead of
  `findUser(id: string)`).
- **Zero Runtime Overhead**: Branded types exist only at compile-time and are erased in the emitted JavaScript.

### Negative

- **Boilerplate**: Requires manual type casting when creating these values (usually in mappers).
- **Interoperability**: Can sometimes make it slightly more complex to work with external libraries that expect raw
  strings, requiring explicit casting back to `string`.
