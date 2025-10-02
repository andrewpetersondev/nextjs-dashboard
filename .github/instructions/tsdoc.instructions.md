---
applyTo: '**'
description: 'description'
---

# TSDoc Rules

Deterministic, concise rules and templates for TSDoc across functions, types, React/Next.js components, and platform
APIs.

---

## 0) Formatting & Brevity

- Aim for comments equal to or less than 5 lines.
- Use triple backticks for code blocks; label with typescript/ts/tsx.
- First line imperative and ≤ 80 chars.
- Prefer the minimal tag set; include a single, compilable example when needed.
- Omit @remarks unless required by the decision rules (below).
- When a TSDoc block contains a fenced code block, wrap the whole comment in four backticks in documentation examples.

---

## 1) Executable Templates (Condensed)

### 1.1 Functions and Methods

````
`typescript
/**
* [ACTION_VERB] [brief description ≤ 80 chars].
*
* [Optional one sentence of core behavior.]
*
* @typeParam T - [Purpose, if present in signature].
* @typeParam E - [Purpose, if present].
* @typeParam U - [Purpose, if present].
* @param param - [Role; include callback signature if applicable].
* @returns [Return structure; note branches or Promise if non-trivial].
* @example
  *```typescript
* // Minimal, strictly typed example that compiles.
* ```
* @remarks
* [Only if needed: side effects, edge cases, identity/allocation if non-obvious,
* error mapping, semantic deviations.]
  */
````

Curried functions (additional rule):

- Document both the outer parameter(s) and the inner parameter(s).
- Name the inner input explicitly (e.g., r: Result<T, E>) in @param of the returned function’s description.

Example addition for currying:

```typescript
/**
 * Provide a fallback value for an error result.
 *
 * @param fallback - (e: E) => T.
 * @returns Fn (r: Result<T, E>) => T.
 */
```

### 1.2 Type Aliases and Interfaces

```typescript
/**
 * [NOUN PHRASE] [brief role].
 *
 * [One sentence on discriminant(s)/readonly/branch shapes and invariants.]
 *
 * @typeParam T - [Purpose, if present].
 * @typeParam E - [Purpose, if present].
 * @remarks
 * Include invariants, readonly guarantees, and performance/branding only if material.
 */
```

For discriminated unions (REQUIRED):

- State the discriminant key and literal values.
- List each variant’s required fields and readonly status.
- Mention identity/allocation notes only if non-trivial.

### 1.3 React Components (Function Components)

````typescript
/**
 * Render [component purpose].
 *
 * [Single sentence on responsibility/constraints.]
 *
 * @param props - Required/optional props; note defaults.
 * @returns React element. [Add SSR/CSR notes only if relevant.]
 * @example
 * ```tsx
 * <MyComponent foo="bar" />
 * ```
 * @remarks
 * - Accessibility: [ARIA/keyboard] if material.
 * - Performance: [memoization guidance] if material.
 */
````

### 1.4 React Hooks

````typescript
/**
 * [ACTION_VERB] [what the hook manages/computes].
 *
 * [Inputs/memoization/effects or identity guarantees in one sentence.]
 *
 * @param arg - [Input shape].
 * @returns [Tuple/object] with meaning of fields.
 * @example
 * ```typescript
 * const [value, setValue] = useMyHook(initial);
 * ```
 */
````

### 1.5 Next.js Route Handlers and Server Actions

````typescript
/**
 * Handle [HTTP method or action].
 *
 * [Inputs, auth/context expectations, response shape.]
 *
 * @param req - Request; note headers/body/query usage if relevant.
 * @returns Response or Promise<Response>. [State JSON/streaming if relevant.]
 * @example
 * ```typescript
 * // Minimal fetch/curl demonstrating request/response.
 * ```
 * @remarks
 * - Runtime: [node/edge], if impactful.
 * - Errors: [how mapped to status], if applicable.
 * - Side effects: [db/logging/external calls], if material.
 */
````

---

## 2) Decision Rules

Include sections only when they add value:

- @remarks

```
 * @remarks
 * [Only if needed: side effects, edge cases, identity/allocation if non-obvious,
 * error mapping, semantic deviations.]
 */
```

Curried functions (additional rule):

- Document both the outer parameter(s) and the inner parameter(s).
- Name the inner input explicitly (e.g., r: Result<T, E>) in @param of the returned function’s description.

Example addition for currying:

```typescript
/**
 * Provide a fallback value for an error result.
 *
 * @param fallback - (e: E) => T.
 * @returns Fn (r: Result<T, E>) => T.
 */
```

Include sections only when they add value:

- @remarks
    - REQUIRED: Side effects (DOM/IO/logging), meaningful edge cases (empty/nullish, cancellation/abort), error
      mapping/narrowing, or deviations from conventional semantics.
    - OPTIONAL: Performance/allocation behavior only when it affects usage and isn’t obvious.
    - OMIT: Restating obvious purity/identity for trivial sync utilities.

- @example
    - REQUIRED: Public APIs and when generics/inference or return branches can confuse usage.
    - OPTIONAL: Constructors/helpers if not obvious.
    - OMIT: When usage is self-evident and inference is straightforward.

- @returns description
    - REQUIRED: Result/Option-like structures; Promise-wrapped results; streams/iterables.
    - OMIT: Redundant restatement of the signature.

- Parameters
    - REQUIRED: Callbacks (signature and return contract).
    - REQUIRED: Optional params with defaults (state the default and its effect).
    - REQUIRED: Variadic/union-typed params (enumerate accepted shapes).
    - REQUIRED for Curried APIs: Document outer param(s) and explicitly name the inner input param(s).

---

## 3) Standardized Phrases

- Constructors: “Success constructor.” / “Error constructor.”
- Type guards: “Type guard for [success|error] branch.”
- Side effects: “No side effects.” or “Side effect on [branch]; returns the original result.”
- Transformations: “[Verb] [input] into [output].”
- Identity/immutability: “Returns the input unchanged.” / “Immutable; produces a new instance.”
- Error behavior: “Maps unknown errors to E.” / “Passes through existing error.”
- Performance: “Allocates new container.” / “Avoids allocation on unchanged branch.”

---

## 4) Overloads & Generics

- Prefer a single canonical description for uniform overload behavior.
- If return shapes differ, enumerate per overload in @returns.
- Document only generics present in the signature; state defaults only if syntactically defined.
- Provide one inference-based example; optionally add one that pins generics when inference may be ambiguous.
- For constrained generics, state the constraint and any runtime invariants that must also hold.

---

## 5) Identity/Allocation (Only if Non-Obvious)

- Mutations: whether inputs are mutated; internal state scope/visibility.
- Identity: whether same instance is returned on no-op paths; reference equality guarantees.
- Allocation: whether new containers are allocated; avoidance on unchanged branches.
- Async: buffer/object reuse, cancellation/AbortSignal semantics, cleanup guarantees.

---

## 6) Return-Type Guidance (As Needed)

- Raw values: note units/invariants (normalized/sorted/deduped) when relevant.
- Option/Maybe: name none/some shapes; identity/allocation notes only when non-trivial.
- Discriminated unions: state discriminant key and exact literal values; list variant fields succinctly.
- Iterables/AsyncIterables: consumption rules (single-use vs reusable), backpressure, error delivery.
- Streams: push vs pull, encoding, chunk type, close/cancel semantics.
- Promises: whether errors reject or are wrapped in Result/Option; whether always resolves.

---

## 7) Tag Policy

- @public, @internal: mark intentional API surface.
- @deprecated: include replacement and rationale.
- @beta/@alpha: stability and expected changes.
- @since: first version where symbol appeared.
- @defaultValue: for fields/props with defaults (and effect).
- @see: reference related symbols; use for aliases/thin wrappers.
- @example: per Decision Rules.
- @remarks: per Decision Rules.
- @privateRemarks: maintainer-only notes.
- @throws: ONLY for synchronous throws; otherwise explain error branches in @returns/@remarks.

Linking:

- Use {@link SymbolName} or {@linkpath ./relative/path#export} for intra-doc references.

---

## 8) Aliases & Re-exports

- For aliases/thin wrappers, write a brief doc and reference the primary API with {@link PrimarySymbol}. Do not
  duplicate behavior docs.
- If an alias name suggests broader capability than the implementation, either:
    - Narrow the docs to align with the implementation and link to the primary; or
    - Change the implementation to match the documented behavior (preferred only when intended).

Example:

```typescript
/**
 * Alias of {@link match}. Returns the callback result (not wrapped).
 *
 * @see match
 */
export const fold = match;
```

---

## 9) Examples Policy (Correctness-First, Minimal)

- Exactly one minimal example for public APIs where inference/branches can confuse.
- Must compile under strict mode.
- Use correct exported symbol names and generic parameter order.
- Avoid variable redeclaration in the same scope.
- For curried APIs, demonstrate both application steps.
- Prefer concise examples; omit imports unless necessary for clarity.

---

## 10) Validation Checklist (Automatable)

All exported symbols MUST satisfy:

- [ ] Brief line imperative, ≤ 80 chars.
- [ ] Only generics present in the signature are documented; defaults stated only if syntactic.
- [ ] All parameters documented; callbacks include signature/contract; curried inner inputs documented.
- [ ] Return structure explained when non-trivial (branches, Promise/stream).
- [ ] Exactly one minimal, compilable example when required.
- [ ] @remarks only when required; no redundant purity/identity notes.
- [ ] Error mapping/fallbacks documented when applicable.
- [ ] Aliases reference the primary API via {@link} or @see; no duplicated content.
- [ ] Consistent vocabulary from Standardized Phrases.
- [ ] Discriminated unions: discriminant key and literal values named; variant fields and readonly status stated.

---

## Mini-Playbooks (Concise)

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
    - Params: onOk, onErr callback signatures.
    - Return: “Returns the callback result; not wrapped in Result.”

- Curried unwrap helpers
    - Document outer param(s) and inner `r: Result<T, E>`.
    - Example shows both application steps.

- React components
    - Brief: “Render [purpose].”
    - Props: required/optional, defaults, controlled/uncontrolled.
    - Remarks: Accessibility or SSR/CSR constraints only if material.

- Hooks
    - Brief: “Compute/manage [responsibility].”
    - Returns: tuple/object; note stable identities if relevant.

- Next.js handlers/actions
    - Brief: “Handle [method/action].”
    - Remarks: runtime (node/edge), error mapping, streaming/caching if applicable.
