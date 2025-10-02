Below are focused, enforceable rules for @shared/forms: naming, structure, and discoverability. Apply consistently and
back with lint rules and small refactors.

Scope and intent

- Purpose: cross-feature form primitives only (types, error mapping, i18n keys, field name resolution, form-data
  parsing, result mapping).
- No feature-specific schemas or action logic here; keep those in features/*.

Directory layout (fixed)

- shared/forms/
    - errors/ — zod-to-form error mapping and helpers
    - fields/ — field-name derivation and resolution utilities
    - i18n/ — shared message keys and constants
    - mapping/ — conversions between Result/Domain and FormState
    - types/ — canonical shared types only
    - utils/ — low-level helpers (FormData parsing, display transforms)
    - README.md — contract and examples

Naming conventions

- Files:
    - Types: *.type.ts or *.types.ts for unions/interfaces (choose one; below uses .type.ts)
    - Utils/helpers: verb-noun.util.ts (e.g., mapResultToFormState.util.ts)
    - Mappers: x-to-y.mapping.ts (e.g., result-to-form-state.mapping.ts)
    - Field utilities: field-*.ts (e.g., field-name-resolution.ts)
    - Error helpers: error-*.ts (e.g., error-map-utils.ts)
    - Constants: *.const.ts (e.g., form-messages.const.ts)
- Exports:
    - Functions: verbNoun (deriveFieldNames, mapZodErrors, parseFormData)
    - Types: PascalCase without I/T prefixes unless generic placeholders (TFieldNames)
    - Enums/consts: PascalCase for types, UPPER_SNAKE for literal message IDs if desired
- Tests: mirror path/name (e.g., errors/error-map-utils.test.ts)

FormState contract (shared/types)

- Keep a single FormState<TFieldNames, TData> type:
    - success: boolean
    - message: string | null
    - data: TData | null
    - errors: DenseFieldErrors<TFieldNames> (every allowed field present, array<string>)
- Use FieldName type parameters for per-form field inference.
- Export supporting types:
    - DenseFieldErrors<TFieldNames extends string>
    - FormMessageId (union of shared message keys)
    - ValidateOptions { loggerContext?: string }

i18n/messages policy (shared/forms/i18n)

- Only define shared, generic keys here (VALIDATION_FAILED, UNEXPECTED, CREATE_SUCCESS, UPDATE_SUCCESS, NO_CHANGES).
- Feature-specific messages live with features, not here.
- Expose:
    - FORM_MESSAGES: Record<FormMessageId, string>
    - resolveFormMessage(id: FormMessageId): string

Error mapping rules (shared/forms/errors)

- Zod mapping produces dense errors aligned to allowed fields:
    - Unknown fields are ignored unless explicitly allowed by the caller.
    - Missing fields appear with [].
- Helpers:
    - mapZodErrorToDense(fieldNames: readonly TFieldNames[], zodError): DenseFieldErrors<TFieldNames>
    - initFailedFormState<TFieldNames, TData>(params): FormState<TFieldNames, TData>
    - buildEmptyDenseErrors(fieldNames): DenseFieldErrors<TFieldNames>
- Never include sensitive values in messages; only keys.

Field name derivation (shared/forms/fields)

- Field names should be derived from schemas when possible:
    - deriveFieldNamesFromSchema(schema): string[]
- Resolution utilities:
    - resolveAllowedFields(schema, overrides?): readonly string[]
    - isAllowedField(name, allowed): boolean

FormData and parsing (shared/forms/utils)

- Parsing is centralized and safe:
    - formDataToObject(formData, allowed): Record<string, string | string[]>
    - getFirst(formData, key): string | undefined
    - getAll(formData, key): string[]
- No normalization here; coercion/transform live in feature schemas (zod).

Mapping to/from Result (shared/forms/mapping)

- Provide thin, generic bridges:
    - resultToFormState<TFieldNames, TData>(result, { successMessage?, errors?, data? }): FormState<TFieldNames, TData>
    - zodSafeParseToFormState<TFieldNames, TOut>(schema, raw, allowed, opts): FormState<TFieldNames, TOut>
- Mappers only compose shared helpers; they shouldn’t know feature specifics.

Server action alignment hooks (what belongs here vs feature)

- In shared/forms:
    - generic validateFormGeneric(formData, schema, allowed?, options?)
- In features:
    - initCtx, validateForm (feature-scoped wrappers providing allowed fields, loggerContext, and message keys)
    - success/failure messages beyond shared keys

Import and barrel policy

- Do not create a top-level barrel for all forms; prefer small, scoped barrels per subfolder:
    - shared/forms/errors/index.ts
    - shared/forms/utils/index.ts
- Feature code imports from specific subfolders to keep dependencies explicit:
    - import { zodSafeParseToFormState } from "@/shared/forms/mapping/zod-parse-to-form-state.mapping"
- If a single entry is truly beneficial, export a curated surface only:
    - shared/forms/index.ts exports FormState, DenseFieldErrors, validateFormGeneric, and FormMessageId. Avoid exporting
      internal helpers.

Environment and side-effects

- No direct logging or env reads inside helpers; accept loggerContext as a string-only hint for callers to log around
  invocations if needed.
- Modules must be isomorphic (usable on server and client); no server-only imports.

Guardrails and linting

- Disallow imports from features/* inside shared/forms/*
- Disallow side-effectful APIs (fetch, db, next/cache) in shared/forms/*
- Enforce filename suffixes: .type.ts, .const.ts, .util.ts, .mapping.ts
- Enforce export names to match file intent (no default exports)

Discoverability checklist when adding a new form

- Schema lives in feature/models or feature/forms (feature scope).
- Allowed fields derived via shared/forms/fields.
- Validation via shared/forms/mapping or validateFormGeneric.
- Errors via shared/forms/errors to produce dense shape.
- Messages: use shared keys where generic; feature keys otherwise.
- FormState<TFieldNames, z.output<typeof schema>> is the return type.

Optional small refactors to align current tree

- Rename types/core-types.util.ts -> types/core.type.ts (or consolidate into form-state.type.ts if that file already
  defines the canonical types).
- Ensure errors/init-failed-form-state.ts uses buildEmptyDenseErrors from the same folder and aligns to the FormState
  type.
- Add scoped index.ts in errors/, mapping/, utils/ exporting only the public helpers.

If you want, I can propose concrete file renames and the curated export surface for shared/forms based on your current
files.
