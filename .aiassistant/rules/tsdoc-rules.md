---
apply: manually
---

This is an AI Rule. You MUST follow it if it contains any instructions or use it as a context otherwise.

# AI Agent TSDoc Rules (Consolidated and Extended)

This document defines deterministic, automatable TSDoc rules and templates for functions, types, React/Next.js components, and platform-specific APIs. It resolves duplication, standardizes formatting, and adds guidance for identity/immutability, overloads, and generics.

---

## 0) Canonical Formatting Rules

- Use triple backticks for normal code blocks. When showing a TSDoc block that itself contains a fenced example, wrap the entire comment in four backticks so the inner example can use triple backticks.
- Label all code blocks with the language: typescript, ts, or tsx as appropriate.
- Keep the first (brief) line of each doc comment imperative and ≤ 80 characters.
- Prefer one blank line between paragraphs inside TSDoc.

**Brevity-first principles**

- Default to the minimal set of tags needed for consumer understanding.
- Omit @remarks unless the decision tree requires it.
- Keep examples minimal (single snippet) and strictly typed.
- Avoid repeating obvious facts (e.g., “does not modify input” for pure one-liners) unless non-obvious.

Example of a TSDoc block containing an example:

````typescript
/**
 * Map success value.
 *
 * Transforms the success branch and preserves the error branch unchanged.
 *
 * @typeParam T - Success type.
 * @typeParam E - Error type.
 * @typeParam U - Mapped success type.
 * @param res - Input result.
 * @param fn - Mapping callback (value: T) => U.
 * @returns Result<U, E>. Returns the original error branch unchanged.
 * @example
 * ```typescript
 * const r = ok(1);
 * const r2 = map(r, (n: number) => n + 1);
 * ```
 * @remarks
 * Avoids allocation when the input is already an error; returns it unchanged.
 */
````

---

## 1) Executable TSDoc Templates

Use these templates (fill in blanks). Prefer the smallest tag set that communicates intent.

### 1.1 Functions and Methods

````typescript
/**
 * [ACTION_VERB] [brief description ≤ 80 chars].
 *
 * [Optional: 1 sentence focusing on core behavior or transformation.]
 *
 * @typeParam T - [Purpose of success type, if generic.]
 * @typeParam E - [Purpose of error type, if relevant].
 * @typeParam U - [Additional generic param purpose, if any.]
 * @param paramName - [Description; include callback signature if applicable.]
 * @returns [Return structure]. Note branches or Promise wrapping if applicable.
 * @example
 * ```typescript
 * // Minimal, typed example that compiles under strict mode.
 * ```
 * @remarks
 * [Include ONLY if required: side effects, edge cases, identity/allocations if non-obvious,
 * error mapping, deviations from conventional behavior.]
 */
````

### 1.2 Type Aliases and Interfaces

```typescript
/**
 * [ACTION_VERB or NOUN PHRASE] [brief description of the type’s role].
 *
 * [1 sentence on discriminants/readonly/branch shapes and key invariants.]
 *
 * @typeParam T - [Purpose].
 * @typeParam E - [Purpose].
 * @remarks
 * Include invariants, readonly guarantees, performance trade-offs, and branding if used.
 */
```

Include for discriminated unions:

- Name the discriminant key and literal values.
- List each variant’s required fields and readonly status.
- Clarify identity/allocation expectations for containers only if non-trivial.

### 1.3 React Components (Function Components)

````typescript
/**
 * Render [component purpose].
 *
 * [1 sentence: core responsibility and constraints.]
 *
 * @param props - Component props. Document required/optional and defaults.
 * @returns React element. [Mention SSR/CSR constraints if relevant.]
 * @example
 * ```tsx
 * <MyComponent foo="bar" />
 * ```
 * @remarks
 * - Accessibility: [ARIA roles/attributes or keyboard interactions].
 * - Performance: [memoization guidance if material].
 */
````

Props documentation guidance:

- For each prop: type, default, controlled/uncontrolled, and interactions.
- For events: callback signature, when invoked, and stability expectations.

### 1.4 React Hooks

````typescript
/**
 * [ACTION_VERB] [what the hook computes or manages].
 *
 * [1 sentence on inputs/memoization/effects or identity guarantees.]
 *
 * @param arg - [Input shape].
 * @returns [Return tuple/object shape] with meanings of fields.
 * @example
 * ```typescript
 * const [value, setValue] = useMyHook(initial);
 * ```
 * @remarks
 * Include side effects or performance notes only if non-obvious/material.
 */
````

### 1.5 Next.js Route Handlers and Server Actions

````typescript
/**
 * Handle [HTTP method or action purpose].
 *
 * [1 sentence on inputs, auth/context expectations, and response shape.]
 *
 * @param req - Request object [headers/body/query usage].
 * @returns Response or Promise<Response>. [State JSON/streaming if relevant.]
 * @example
 * ```typescript
 * // Minimal curl/fetch demonstrating request/response shape.
 * ```
 * @remarks
 * - Runtime: [node/edge] if it impacts usage.
 * - Errors: [how errors map to HTTP status, if applicable].
 * - Side effects: [db writes, logging, external calls] if material.
 */
````

---

## 2) Decision Trees (Single Source of Truth)

Include sections based on the criteria below.

- @remarks
  - REQUIRED: Side effects (DOM, IO, logging), meaningful edge cases (empty input, nullish, cancellation/abort), error mapping/narrowing, or deviations from conventional semantics.
  - OPTIONAL: Performance/allocation behavior only if it affects consumer usage or is non-obvious.
  - OMIT: Restating obvious purity/identity for simple, synchronous utilities.

- @example
  - REQUIRED: Public API or where generics/inference could confuse usage.
  - OPTIONAL: Constructors and helpers if not obvious.
  - OMIT: When usage is self-evident and no type inference pitfalls exist.

- Return structure description
  - REQUIRED: Result/Option-like structures; Promises of those; stream/iterable semantics.
  - OMIT: Redundant rephrasing of the signature when it adds no new information.

- Parameter depth
  - REQUIRED: Callbacks (parameter types and return contract).
  - REQUIRED: Optional params with defaults (state the default and effect).
  - REQUIRED: Variadic/union-typed params (enumerate accepted shapes).

---

## 3) Standardized Language Patterns

Use these phrases for consistency (apply only when relevant):

- Constructors: “Success constructor.” / “Error constructor.”
- Type guards: “Type guard for [success|error] branch.”
- Side effects: “Side effect on [success|error]; returns the original result.” or “No side effects.”
- Transformations: “[Verb] [input] into [output].”
- Identity/immutability: “Returns the input unchanged.” / “Immutable; produces a new instance.”
- Error behavior: “Maps unknown errors to E.” / “Passes through existing error.”
- Performance: “Allocates new container.” / “Avoids allocation on unchanged branch.”

Aliases and re-exports:

- For aliases or thin wrappers, write a brief doc and reference the primary API with {@link PrimarySymbol} instead of duplicating content. Prefer @see over repeating details.

---

## 4) Overloads and Generics Nuance

- Overloads
  - Prefer a single canonical signature description if behavior is uniform.
  - If overloads differ materially, document each briefly with a focused @example.
  - In @returns, enumerate result shapes per overload if the return type varies.
  - In @remarks, state resolution rules only if runtime shape affects selection.

- Generics
  - Document all @typeParam entries actually present.
  - State a default only if the type parameter has a syntactic default in the signature.
  - Provide one example relying on inference and (if helpful) one that pins generics when inference may be ambiguous.
  - For constrained generics, include the constraint and any runtime invariants that must also hold.

---

## 5) Identity, Immutability, and Allocation Checklist

Include in @remarks only when non-obvious or material:

- Mutations
  - Mutates input arguments: [yes/no]. If yes, list which and how.
  - Mutates internal state only: [scope and visibility].
- Identity
  - Returns the same instance on no-op paths: [yes/no].
  - Preserves reference equality for unchanged branches: [yes/no].
- Allocation
  - Allocates a new container on success/error mapping: [yes/no].
  - Avoids allocation when no change occurs: [yes/no].
- Concurrency/Async
  - Reuses buffers/objects across emissions (streams/iterables): [yes/no].
  - Cancellation/AbortSignal semantics: [how to cancel and cleanup guarantees].

---

## 6) Broadened Return-Type Guidance

Document specifics for these families only as needed:

- Raw values: State units/invariants (e.g., normalized, sorted, deduped) if relevant.
- Option/Maybe: Name none/some shapes; identity/allocation behavior only if non-trivial.
- Discriminated unions: Name discriminant key and exact literal values; list variant fields succinctly.
- Iterables/AsyncIterables: Consumption rules (single-use vs reusable), backpressure, and error delivery.
- Streams/Readable-like: Push vs pull, encoding, chunk type, close/cancel semantics.
- Promises: Whether rejections are used or errors are wrapped in Result/Option; whether the function always resolves.

---

## 7) Tag Policy (Allowed and When to Use)

Use these tags when they add value:

- @public, @internal: Mark API surface intentionally.
- @deprecated: Include replacement and rationale.
- @beta or @alpha: Stability and expected changes.
- @since: First version where this symbol appeared.
- @defaultValue: For fields/props with defaults (state effect).
- @see: Related symbols or concepts (prefer for aliases).
- @example: As per decision tree.
- @remarks: As per decision tree.
- @privateRemarks: Maintainer notes not intended for published docs.
- @throws: Only when the function throws synchronously; otherwise, explain error branches in @returns/@remarks.

Linking:

- Use {@link SymbolName} or {@linkpath ./relative/path#export} for intra-doc references.

---

## 8) Mini-Playbooks

Keep each playbook concise; prefer one example and an optional remark only if non-obvious.

- ok/err constructors
  - Brief: “Success constructor.” / “Error constructor.”
  - Returns: “Result<T, E> with [success|error] branch.”
  - Example: Construct and assert via type guard.

- map/mapError
  - Brief: “Map [success|error] value.”
  - Params: callback signature and return contract.
  - Return: “Result<U, E>” or “Result<T, F>”.
  - Remarks: Allocation/identity notes only if non-trivial.

- match
  - Brief: “Pattern-match on result.”
  - Params: onSuccess, onError callback signatures.
  - Return: “Returns the callback result; not wrapped in Result.”
  - Remarks: Side effects allowed in callbacks (if worth stating).

- React components
  - Brief: “Render [component purpose].”
  - Props: required/optional, defaults, controlled/uncontrolled.
  - Remarks: Accessibility or SSR/CSR constraints only if material.

- Hooks
  - Brief: “Compute/manage [responsibility].”
  - Returns: Tuple/object; document stable identities if relevant.
  - Remarks: Side effects/memoization specifics only if non-obvious.

- Next.js handlers/actions
  - Brief: “Handle [method/action].”
  - Remarks: Runtime (node/edge), error mapping, streaming/caching if applicable.

---

## 9) Example Skeletons

Result mapping:

````typescript
/**
 * Map success value.
 *
 * Transforms the success branch and preserves the error branch unchanged.
 *
 * @typeParam T - Success type.
 * @typeParam E - Error type.
 * @typeParam U - Mapped success type.
 * @param res - Input result.
 * @param fn - (value: T) => U mapping callback.
 * @returns Result<U, E>. Returns the original error branch unchanged.
 * @example
 * ```typescript
 * const r = ok(1);
 * const r2 = map(r, (n) => n + 1);
 * ```
 */
````

React component:

````typescript
/**
 * Render a labeled input field with optional error text.
 *
 * Provides controlled/uncontrolled usage with accessible labeling.
 *
 * @param props - Props including id (required), label, value/onChange or defaultValue.
 * @returns React element.
 * @example
 * ```tsx
 * <LabeledInput id="email" label="Email" value={email} onChange={setEmail} />
 * ```
 */
````

Hook:

````typescript
/**
 * Manage debounced value updates.
 *
 * Returns a debounced value and a setter.
 *
 * @param initial - Initial value.
 * @param delayMs - Debounce delay in milliseconds. Defaults to 300.
 * @returns [value, setValue] where value updates after delayMs.
 * @example
 * ```typescript
 * const [q, setQ] = useDebouncedValue("", 250);
 * ```
 */
````

Next.js handler:

````typescript
/**
 * Handle GET user profile.
 *
 * Validates auth and returns user JSON.
 *
 * @param req - Incoming request; requires Authorization header.
 * @returns Promise<Response> with JSON body or error status.
 * @example
 * ```typescript
 * const res = await fetch("/api/user", { headers: { Authorization: "Bearer ..." } });
 * ```
 */
````

---

## 10) Validation Checklist (Automatable)

All exported symbols MUST satisfy:

- [ ] Brief line is imperative and ≤ 80 chars.
- [ ] Only generics present in the signature are documented with @typeParam.
- [ ] Defaults are stated only when syntactically defined in the signature.
- [ ] All parameters documented; callbacks include signature and return contract.
- [ ] Return structure explained when non-trivial (branches, Promise/stream).
- [ ] Exactly one minimal example for public APIs where inference could confuse usage.
- [ ] @remarks included only when required by the decision tree.
- [ ] No redundant notes on purity/identity/allocation for trivial, pure utilities.
- [ ] Error mapping and fallbacks documented when applicable.
- [ ] Aliases/thin wrappers reference the primary API via {@link} or @see (no duplication).
- [ ] Consistent vocabulary from Standardized Language Patterns.

---

Adopt this document as the single source of truth for TSDoc authoring.
