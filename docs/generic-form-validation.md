# Generic Form Validation

## Immediate Action Items

1. Unify schemas: Refactor all schemas to

## Layers + Boundaries to consider

1. User Interface
    1. Initial State
    2. Client side validation
    3. Handle Success + Handle Failure
2. Server Action
    1. Zod
        1. Zod Schema Validation + Transformations
            1. `transform` happens after validation
            2. `preprocess` happens before validation
        2. Zod Types
            1. `infer` = `output` = the schema’s output type after parsing/transformations. Equivalent to z.output
            2. `input` = The schema’s input type before parsing/validation/transformations.
        3. Handle Success + Handle Failure schema validation
    4.
3. Service
4. Repository
5. Data Access Layer

## Key Topics

- _Dense_ vs _Sparse_ error shape
    - Dense = every form key is present, and values are either array of messages of empty array
    - Sparse = form key is only present if values contain non-empty array
-

## User Interface

- Uses Dense error shape.
- Create form for each feature (auth= login, signup; user= create, update; invoice= create, update)
- Generic Function to build initial state
- Every form has a zod schema

## Server Action (id? , prevState?, formData)

### mind dump

Here’s a concise, unified checklist for form server actions.

Core building blocks

- Zod schema (input validation and transforms)
- Derived field keys from schema (allowed fields)
- Raw payload projection (FormData -> raw map limited to allowed fields)
- Typed FormState shape (success, message, data, fieldErrors)
- Common error/message catalog
- Logger context

Validation workflow

- Parse FormData to raw map (only allowed fields)
- Safe-parse with Zod (handle success/failure)
- Optional post-parse transform (normalize/derive; async-safe)
- Dense error map creation from Zod errors
- Return early on validation failure with consistent FormState

Service workflow

- Build domain object/patch from validated data
- Call service/repository layer
- Map service success/failure to FormState
- Revalidation/side-effects hooks (e.g., revalidatePath)

Error handling

- Handle schema failure (field-level errors)
- Handle service failure (message + empty dense errors)
- Handle unexpected errors (log minimal safe context, generic message)
- Consistent failure builder helper (uses fields/raw/emptyDense)

Security and robustness

- Field allow-list enforcement (no overposting)
- Input normalization (trim/lowercase, etc.)
- Id parsing/validation (route params -> domain ids)
- Safe logging (avoid PII, include context and issue count)
- Idempotency/no-op detection (e.g., diff-based patch)
- Rate limiting/throttling hooks (optional)
- CSRF/session checks where applicable

Reusability/utilities

- derive allowed field names from schema
- formData -> raw map
- validateFormGeneric wrapper (schema, fields, transform)
- shallow diff helper for patch updates
- dense/sparse error mapping utilities
- result -> FormState converter

State and UX

- Initial FormState builder (for UI)
- Success messages (domain-specific)
- No-changes message path
- Preserve raw input on failure for re-fill

Types and contracts

- Strongly-typed field name union
- Input vs output types (z.input vs z.output/infer)
- Typed service DTOs/patch types
- Narrowed error types for mapping

Operational concerns

- Revalidate caches/paths on success
- Transaction boundaries if needed
- Observability hooks (metrics/timing)
- Feature flags/toggles for behavior changes

Testing

- Unit tests for validate/transform/buildPatch
- Integration tests for server action happy/sad paths
- Contract tests for error shapes and messages

Documentation

- Action-specific loggerContext
- Inline comments on transforms and patch rules
- Example flows for create/update/delete forms

### Continued

- `validateFormGeneric` accepts (formData, schema, allowedFields?, options={})
