# Server Actions Forms Refactor Plan

This document outlines the alignment plan for all server actions that handle FormData, using centralized Zod-based
validation and a consistent FormState contract.

## Goals

- Single validation path for all forms via validateFormGeneric using z.output types.
- Consistent FormState shape and error density across actions.
- Clear policy for redirecting vs returning FormState.
- Side-effect safety: only after successful validation.
- Centralized i18n messages and logging conventions.

## Action Contract

- All actions return FormState<TFieldNames, TData>.
- Redirect-only actions (e.g., auth flows) must:
    - Return FormState on failure.
    - Redirect on success (no value returned afterward).
- Non-redirect actions must:
    - Always return FormState with data/message/success.
- Do not throw after a FormState is constructed.

## Validation Rules

- Use validateFormGeneric<TIn, TFieldNames, TOut>(formData, schema, allowedFields?, options).
- Prefer z.output from schemas that use preprocess/pipe/transform.
- Avoid manual coercion in actions; put normalization into Zod schemas.
- Provide a loggerContext per action to trace validation failures.
- Derive allowed field names from schemas; do not hardcode:
    - Use canonical derivation helpers and pass the resolved fields to validation.

## Error Handling

- Always return dense per-field errors aligned with allowed fields (empty arrays permitted).
- On Zod failures: map to dense errors and attach a consistent top-level message (e.g., VALIDATION_FAILED).
- On unexpected errors: return an empty dense error map with an UNEXPECTED message.
- Never log sensitive raw values (passwords, tokens); log minimal safe metadata.

## Messages and Logging

- Use centralized i18n/message modules with consistent keys:
    - VALIDATION_FAILED, UNEXPECTED, NOT_FOUND, CREATE_SUCCESS, UPDATE_SUCCESS, CREATE_FAILED, UPDATE_FAILED,
      INVALID_CREDENTIALS, NO_CHANGES.
- Logging conventions:
    - logger context: "<actionName>.<phase>" (e.g., login.validate, updateUserAction.persist).
    - severity: warn for expected empty results; error for exceptions.
    - include action-safe identifiers (e.g., user id) when helpful; exclude secrets.

## Side-Effects Ordering

- Only execute side effects after successful validation:
    - DB writes/updates
    - Event publishing
    - Cache revalidation
    - Session creation
    - Redirects
- Ensure idempotency where feasible (e.g., safe duplicate handling).

## Naming and Structure

- Action names: verbNounAction (e.g., createUserAction, updateUserAction). Auth redirectors may be verb-only where
  appropriate (login, signup).
- Co-locate schema and field-name types with feature modules.
- Use small helpers to organize actions:
    - initCtx: resolve fields/raw/empty errors for the action.
    - validateForm: thin wrapper over validateFormGeneric with action context.
    - fail: builds a standardized failure FormState for the action.

## DTO Shapes

- Inputs: z.input when constructing schemas; Outputs: z.output for validated/normalized data.
- FormState data should use output types (normalized, ready for service layer).
- Services/Repos/DAL accept domain DTOs; conversion belongs at the boundary after validation.

## Test Checklist

- Validation:
    - Schema failure returns dense errors and VALIDATION_FAILED.
    - Preprocess/pipe transformations apply correctly (using z.output expectations).
- Side effects:
    - Not called on validation failure.
    - Called exactly once on success with correct payload.
- Redirect policy:
    - Redirecting actions return FormState on failure and navigate on success.
- Messages:
    - Success/failure messages align with i18n keys.
- Logging:
    - Uses action-specific loggerContext; no sensitive data emitted.

## Migration Steps

1) Inventory actions

- List all server actions that accept FormData.
- Classify as redirecting vs non-redirecting.

2) Schema readiness

- Ensure schemas implement all coercion/normalization with preprocess/pipe.
- Confirm z.output matches the data expected by services.

3) Field derivation

- Replace hardcoded field names with derived field sets.
- Add explicit fields arrays only where schema keys must be narrowed.

4) Centralize validation calls

- Convert actions to call validateFormGeneric with:
    - schema, derived fields, loggerContext, and prebuilt raw map if needed.
- Remove manual FormData coercions from actions.

5) Error mapping and messages

- Replace custom Zod error handling with standardized dense mapping.
- Use shared i18n messages; eliminate inline strings.

6) Side-effects isolation

- Move all side effects after a successful validation branch.
- Add event publishing and cache revalidation consistently where needed.

7) Logging alignment

- Adopt consistent logger contexts and severities.
- Remove sensitive data from logs.

8) Auth-specific behavior

- Keep redirect-on-success for auth actions.
- Ensure session setup happens only after successful validation/auth.

9) Consistency review

- Verify action naming, helper usage, and DTO typing.
- Ensure FormState data is z.output-based everywhere.

10) Tests and CI

- Add/adjust tests as per the checklist.
- Gate merges on passing validation/side-effect/redirect tests.

## Examples Outline

- Redirecting action (Auth):
    - initCtx with fields/raw
    - validateFormGeneric with loggerContext
    - if failure: return FormState
    - authenticate → set session → redirect

- Non-redirect action (CRUD):
    - initCtx with fields/raw/empty dense
    - validateFormGeneric
    - if failure: return FormState
    - call service/repo
    - publish events/revalidate cache
    - return success FormState with data/message

## Conventions Summary

- Single source of truth for field names and error shapes.
- z.output everywhere post-parse.
- Dense errors internally; UI can derive its view from FormState.
- Minimal, safe logging; centralized messages.
- Side effects only after validation success; redirects only in designated actions.
