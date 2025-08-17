---
apply: manually
---

# AI Agent TSDoc Rules (Consolidated and Extended)

This document defines deterministic, automatable TSDoc rules and templates for functions, types, React/Next.js components, and platform-specific APIs. It resolves duplication, standardizes formatting, and adds guidance for identity/immutability, overloads, and generics.

---

## 0) Canonical Formatting Rules

- Use triple backticks for normal code blocks. When showing a TSDoc block that itself contains a fenced example, wrap the entire comment in four backticks so the inner example can use triple backticks.
- Label all code blocks with the language: typescript, ts, or tsx as appropriate.
- Keep the first (brief) line of each doc comment imperative and ≤ 80 characters.
- Prefer one blank line between paragraphs inside TSDoc.

Example of a TSDoc block containing an example:

````typescript
/**
 * Map success value.
 *
 * Transforms the success branch and preserves the error branch unchanged.
 *
 * @typeParam T - Success type.
 * @typeParam E - Error type. Defaults to `Error`.
 * @typeParam U - Mapped success type.
 * @param res - Input result.
 * @param fn - Mapping callback (value: T) => U.
 * @returns Result<U, E>. Returns the original error branch unchanged.
 * @example
 * ```typescript
 * const r = ok(1);
 * const r2 = map(r, (n: number) => n + 1);
 * // r2 is Result<number, Error>
 * ```
 * @remarks
 * Avoids allocation when the input is already an error; returns it unchanged.
 */
````

---

## 1) Executable TSDoc Templates

Use these exact templates (with edits filled in) for all exported APIs.

### 1.1 Functions and Methods

````typescript
/**
 * [ACTION_VERB] [brief description ≤ 80 chars].
 *
 * [Detailed description (1–2 sentences) focusing on core effect or transformation.]
 *
 * @typeParam T - [Purpose of success type, if generic.]
 * @typeParam E - [Purpose of error type, if relevant]. Defaults to `Error`.
 * @typeParam U - [Additional generic param purpose, if any.]
 * @param paramName - [Description with type context; include callback signature if applicable.]
 * @returns [Return structure]. Mention success/error branches; note Promise wrapping explicitly.
 * @example
 * ```typescript
 * // Minimal, typed, copy-pasteable example that compiles under strict mode.
 * ```
 * @remarks
 * [Include only if required by the decision tree: side effects, edge cases, identity semantics,
 * performance/allocations, error mapping, deviations from conventional behavior.]
 */
````

### 1.2 Type Aliases and Interfaces

```typescript
/**
 * [ACTION_VERB or NOUN PHRASE] [brief description of the type’s role].
 *
 * [1 sentence on discriminants, immutability/readonly, branch shapes, and key invariants.]
 *
 * @typeParam T - [Purpose].
 * @typeParam E - [Purpose]. Defaults to `Error`.
 * @remarks
 * State invariants, readonly guarantees per field, performance trade-offs, and branding if used.
 */
```

Include for discriminated unions:

- Name the discriminant key and literal values.
- List each variant’s required fields and readonly status.
- Clarify identity and allocation expectations for containers.

### 1.3 React Components (Function Components)

````typescript
/**
 * Render [component purpose].
 *
 * [1–2 sentences: core responsibility, controlled/uncontrolled behavior, and constraints.]
 *
 * @param props - Component props. Document required/optional and defaults.
 * @returns React element. [State SSR/CSR compatibility or server/client constraints.]
 * @example
 * ```tsx
 * <MyComponent foo="bar" />
 * ```
 * @remarks
 * - Accessibility: [expected ARIA roles/attributes, keyboard interactions, labeling rules].
 * - Performance: [memoization guidance, stable callback/refs expectations].
 * - Identity: [whether props/state mutations occur; generally "No side effects."].
 */
````

Props documentation guidance:

- For each prop: type, default, whether controlled or uncontrolled, and interactions.
- For events: callback signature, when invoked, and whether it must be stable (e.g., useCallback).

### 1.4 React Hooks

````typescript
/**
 * [ACTION_VERB] [what the hook computes or manages].
 *
 * [1–2 sentences on inputs, memoization, effects, and cache/identity guarantees.]
 *
 * @param arg - [Input shape].
 * @returns [Return tuple/object shape] with explicit meanings of fields.
 * @example
 * ```typescript
 * const [value, setValue] = useMyHook(initial);
 * ```
 * @remarks
 * - Side effects: [describe useEffect/useLayoutEffect usage if any].
 * - Identity: [stable references guarantees across renders].
 * - Performance: [memoization, allocation on each render].
 */
````

### 1.5 Next.js Route Handlers and Server Actions

````typescript
/**
 * Handle [HTTP method or action purpose].
 *
 * [1–2 sentences on inputs, auth/context expectations, and response shape.]
 *
 * @param req - Request object [document headers/body/query usage].
 * @returns Response or Promise<Response>. [State JSON shape or streaming semantics.]
 * @example
 * ```typescript
 * // curl example or fetch invocation demonstrating request/response shape.
 * ```
 * @remarks
 * - Runtime: [node/edge] and any limitations (e.g., no fs on edge).
 * - Errors: [map errors to HTTP status; structure of error responses].
 * - Side effects: [db writes, logging, external calls].
 */
````

---

## 2) Decision Trees (Single Source of Truth)

Include sections based on the criteria below.

- @remarks
  - REQUIRED: Side effects exist (DOM, IO, logging), edge cases (empty input, nullish, cancellation/abort), error mapping/narrowing, deviations from conventional semantics (e.g., non-throwing by design).
  - OPTIONAL: Performance and allocation behavior material to consumers.

- @example
  - REQUIRED: Public API or complex generics/inference.
  - OPTIONAL but recommended: Constructors and helpers.
  - OPTIONAL: Pure data types unless discriminated unions benefit from examples.

- Return structure description
  - REQUIRED: Result-like or Option-like structures; Promises of Result/Option; identity semantics (returns same instance).
  - REQUIRED: Streams, Iterables/AsyncIterables (push/pull, backpressure, consumption rules).

- Parameter depth
  - REQUIRED: Callbacks (list parameter types and return contract).
  - REQUIRED: Optional params with defaults (state default and effect).
  - REQUIRED: Variadic/union-typed params (enumerate accepted shapes).

---

## 3) Standardized Language Patterns

Use these phrases verbatim to ensure consistency:

- Constructors: “Success constructor.” / “Error constructor.”
- Type guards: “Type guard for [success|error] branch.”
- Side effects: “Side effect on [success|error]; returns the original result.” or “No side effects.”
- Transformations: “[Verb] [input] into [output].”
- Identity/immutability: “Returns the input unchanged.” / “Immutable; produces a new instance.”
- Error behavior: “Maps unknown errors to E.” / “Passes through existing error.”
- Performance: “Allocates new container.” / “Avoids allocation on unchanged branch.”

---

## 4) Overloads and Generics Nuance

- Overloads
  - Document either:
    - A single canonical signature with a precise description of overload behavior, or
    - Each overload separately with its own concise @example focused on that variant.
  - In @returns, enumerate the result shapes per overload if the return type varies.
  - In @remarks, state resolution rules if overload selection depends on runtime shape.

- Generics
  - Document all @typeParam entries; state defaults explicitly (e.g., “E defaults to Error”).
  - Show at least one example that relies on type inference (no explicit generics) and one that pins generics when inference might be ambiguous.
  - For constrained generics, include the constraint and any runtime invariants that must also hold.

---

## 5) Identity, Immutability, and Allocation Checklist

If any apply, include in @remarks:

- Mutations
  - Mutates input arguments: [yes/no]. If yes, list which and how.
  - Mutates internal state only: [describe scope and visibility].
- Identity
  - Returns the same instance on no-op paths: [yes/no].
  - Preserves reference equality for unchanged branches: [yes/no].
- Allocation
  - Allocates a new container on success/error mapping: [yes/no].
  - Avoids allocation when no change occurs: [yes/no].
- Concurrency/Async
  - Reuses buffers/objects across emissions (streams/iterables): [yes/no].
  - Cancellation/AbortSignal semantics: [how to cancel and guarantees on cleanup].

---

## 6) Broadened Return-Type Guidance

Document specifics for these common families:

- Raw values: State units/invariants (e.g., normalized, sorted, deduped).
- Option/Maybe: Name the none/some shapes; identity and allocation behavior on map.
- Discriminated unions: Name discriminant key and exact literal values; list variant fields.
- Iterables/AsyncIterables: Consumption rules (single-use vs reusable), backpressure, and error delivery (throw vs error item).
- Streams/Readable-like: Push vs pull, encoding, chunk type, and close/cancel semantics.
- Promises: Whether rejections are used or errors are wrapped in Result/Option; whether the function always resolves.

---

## 7) Tag Policy (Allowed and When to Use)

Use these tags consistently:

- @public, @internal: Mark API surface intentionally.
- @deprecated: Include replacement and rationale.
- @beta or @alpha: Stability and expected changes.
- @since: First version where this symbol appeared.
- @defaultValue: For fields/props with defaults (state effect).
- @see: Related symbols or concepts.
- @example: As per decision tree.
- @remarks: As per decision tree.
- @privateRemarks: Maintainer notes not intended for published docs.
- @throws: Use only when the function throws synchronously; otherwise, document error mapping/Result behavior in @returns/@remarks. If throws are discouraged, prefer documenting error branches over @throws.

Linking:

- Use {@link SymbolName} or {@linkpath ./relative/path#export} for intra-doc references.

---

## 8) Mini-Playbooks

- ok/err constructors
  - Brief: “Success constructor.” / “Error constructor.”
  - Returns: “Result<T, E> with [success|error] branch.”
  - Example: Construct and assert via type guard.
  - Remarks: Allocation/identity on repeated calls if relevant.

- map/mapError
  - Brief: “Map [success|error] value.”
  - Params: callback signature and return contract.
  - Return: “Result<U, E>” or “Result<T, F>”.
  - Remarks: Allocation behavior; unchanged branch returned as-is.

- match
  - Brief: “Pattern-match on result.”
  - Params: onSuccess, onError callbacks with signatures.
  - Return: “Returns the callback result; does not wrap in Result.”
  - Remarks: Side effects allowed; document expectations.

- React components
  - Brief: “Render [component purpose].”
  - Props: required/optional, defaults, controlled/uncontrolled.
  - Remarks: Accessibility, performance (memo), SSR/CSR constraints.

- Hooks
  - Brief: “Compute/manage [responsibility].”
  - Returns: Tuple/object with stable identities documented.
  - Remarks: Side effects and memoization specifics.

- Next.js handlers/actions
  - Brief: “Handle [method/action].”
  - Remarks: Runtime (node/edge), error mapping to HTTP status, streaming/caching semantics.

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
 * @typeParam E - Error type. Defaults to `Error`.
 * @typeParam U - Mapped success type.
 * @param res - Input result.
 * @param fn - (value: T) => U mapping callback.
 * @returns Result<U, E>. Returns the original error branch unchanged.
 * @example
 * ```typescript
 * const r = ok(1);
 * const r2 = map(r, (n: number) => n + 1);
 * // r2 is Result<number, Error>
 * ```
 * @remarks
 * Avoids allocation when the input is already an error; returns it unchanged.
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
 * @remarks
 * - Accessibility: Associates label via htmlFor and id.
 * - Performance: Prefer stable onChange to avoid re-renders.
 * - No side effects.
 */
````

Hook:

````typescript
/**
 * Manage debounced value updates.
 *
 * Returns a debounced value and a setter; the value updates after the delay.
 *
 * @param initial - Initial value.
 * @param delayMs - Debounce delay in milliseconds. Defaults to 300.
 * @returns [value, setValue] where value updates after delayMs.
 * @example
 * ```typescript
 * const [q, setQ] = useDebouncedValue("", 250);
 * ```
 * @remarks
 * - Side effects: Uses timers; cleared on unmount or delay change.
 * - Identity: setValue is stable across renders.
 */
````

Next.js handler:

````typescript
/**
 * Handle GET user profile.
 *
 * Validates auth and returns user JSON; returns 401/404 on failure.
 *
 * @param req - Incoming request; requires Authorization header.
 * @returns Promise<Response> with JSON body or error status.
 * @example
 * ```typescript
 * const res = await fetch("/api/user", { headers: { Authorization: "Bearer ..." } });
 * ```
 * @remarks
 * - Runtime: node.
 * - Errors: Maps domain errors to HTTP status codes; returns JSON error body.
 * - Side effects: Database reads; structured logging per request.
 */
````

---

## 10) Validation Checklist (Automatable)

All exported symbols MUST satisfy:

- [ ] Brief line is imperative and ≤ 80 chars.
- [ ] All generics documented with @typeParam; defaults stated where applicable.
- [ ] All parameters documented with type context; callbacks include signature and return contract.
- [ ] Return structure explained (branches, Promise/stream wrapping as applicable).
- [ ] Example present for public APIs and complex generics; compiles under strict mode.
- [ ] Side effects explicitly mentioned or “No side effects.”
- [ ] Identity/immutability/allocations stated when relevant.
- [ ] Error mapping and fallbacks documented (unknown → Error/E or none).
- [ ] Edge cases captured in @remarks per decision tree.
- [ ] Consistent vocabulary from Standardized Language Patterns.

---

Adopt this document as the single source of truth for TSDoc authoring.
