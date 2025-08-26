# Boundary Audit and Type-Safety Strengthening Plan

Date: 2025-08-25
Scope: src/shared, src/server, src/features, src/ui
Next.js: 15+  •  TypeScript: 5+

This document lists discovered weaknesses across the four project boundaries and proposes a concrete, incremental plan to strengthen type-safety, runtime validation, and architectural boundaries.


## Summary of Boundaries
- src/shared: cross-cutting utils, value objects, brands, DTOs and client-safe schemas.
- src/server: entities, repositories, services, server actions, server-only schemas and codecs.
- src/features: feature-specific client code (components, hooks, client-safe types/schemas, mappers). Should not depend on server-only code.
- src/ui: generic, reusable UI primitives. Should not depend on features or server.


## Key Weaknesses Found

1) Shared → Server dependency leak (inversion of dependency)
- File: src/shared/brands/domain-brands.ts
  - Imports from: @/server/errors/mappers
  - Impact: src/shared should never import from src/server. This creates an upward dependency and allows server to leak into client bundles transitively.
  - Fix: Move mapping/adapter concerns to src/server errors; keep shared brands dependent only on shared validation/result/errors (if those are truly shared).

2) Features importing server-only code (boundary violations)
- Files importing from src/server inside src/features:
  - src/features/revenues/lib/data/merge.ts → @/server/logging/logger, @/server/revenues/entity, @/server/revenues/utils/template
  - src/features/revenues/lib/data/lookup.ts → @/server/logging/logger, @/server/revenues/entity
  - Multiple components use server actions/types from src/server (acceptable only if:
    - type imports are type-only from client, and
    - server actions are bound and passed to forms in a compliant way).
- Risks: Client bundles may accidentally include server-only code (logger, entities with server-only semantics). Also complicates testing and violates layering.
- Fix: 
  - Replace imports of server entities with shared DTOs or feature-local client-safe types.
  - Replace server logger usage in features with a client-safe logger or no-op.
  - Keep server actions imported in client components only as actions (allowed), but do not import server-only types (prefer shared DTOs).

3) DTO placement and usage
- Example: src/server/users/dto.ts is marked server-only, yet used as type in client code (e.g., EditUserForm props). While `import type` often erases at compile-time, it references a module with `import "server-only"`, which is fragile and can break with bundler settings.
- Fix: Promote client-consumed DTOs to src/shared/<domain>/dto.ts (pure POJOs). Server maps entities→DTOs. Client code consumes the shared DTO.

4) Incomplete or placeholder schemas
- Empty or placeholder files reduce confidence and increase drift:
  - src/server/users/schema.ts (empty)
  - src/shared/auth/time.ts (empty)
  - src/features/auth/schema.client.ts (empty)
  - src/features/revenues/schema.ts (empty)
  - src/features/invoices/schema.ts has only a comment
- Fix: Either remove placeholders or fill with minimal, client-safe/server-safe schemas as appropriate.

5) Validation inconsistencies
- src/features/users/schema.client.ts: emailSchema regex enforces @dummy.com but the error message says "must end with @mail.com." (mismatch increases confusion).
- Fix: Align the message with the rule and/or move the domain restriction out if it was for demos only.

6) Security-sensitive constants in shared
- src/shared/auth/constants.ts defines SALT_ROUNDS, SESSION settings. SALT_ROUNDS should be server-only; clients do not need or should not know hashing details.
- Fix: Move SALT_ROUNDS to src/server/auth/hashing.ts or a server constants module. Keep shared with non-sensitive, truly cross-boundary constants only.

7) Mixed schema layering
- Zod schemas exist in shared (src/shared/auth/zod.ts) and elsewhere. Ensure a clear layering:
  - server-only schemas that validate entities, repositories, and server action payloads/results live under src/server.
  - client-safe schemas (form validation) live under src/features/<feature>/schema.client.ts.
  - shared schemas only when truly common and client-safe (e.g., an enum of roles).

8) Lack of enforced import rules
- While code comments and docs describe boundaries, there is no automated enforcement preventing:
  - src/shared → src/server imports
  - src/ui → src/features imports
  - client components importing server-only modules (beyond best-effort `import "server-only"`).
- Fix: Add ESLint import/no-restricted-paths or eslint-plugin-boundaries rules, and/or use tsconfig references or path conventions that fail builds on violations.

9) Entity vs DTO vs ViewModel clarity
- Server entities and DTOs are not consistently separated across all domains. Some features lean directly on server entities from the client side.
- Fix: Adopt a standard set:
  - Entity (server-only, branded types & invariants) → src/server/<domain>/entity.ts
  - DTO (shared, POJO, client-safe) → src/shared/<domain>/dto.ts
  - ViewModel (feature-specific shaping/formatting) → src/features/<feature>/types.ts or lib/formatters.ts

10) Logging in client-side feature libs
- src/features/revenues/lib/data/* uses @/server/logging/logger. This is server-only and should not be bundled client-side.
- Fix: Provide a client-safe logger facade under src/shared/logging/logger.ts with no-op in browser or use console.* guarded by environment checks.


## Strengthening Plan (Incremental, with guardrails)

1) Enforce boundaries automatically
- (NOTE: SKIP THIS STEP. BIOME IS ALREADY CONFIGURED AND WORKS SIMILARLY) Add ESLint rules: 
  - Disallow imports from src/server in src/features and src/ui (except type-only imports from src/server/types if you decide to keep any there, but recommended to move to shared).
  - Disallow imports from src/server in src/shared entirely.
  - Disallow imports from src/features in src/ui.
- Add path group rules to keep import order tidy.
- Action: Update eslint.config.mjs accordingly and run pnpm biome-check to ensure formatting/conventions.

2) Fix the shared→server leak
- Refactor src/shared/brands/domain-brands.ts to remove import from @/server/errors/mappers.
  - If mapping is needed, move it into a server adapter, e.g., src/server/errors/brand-mapping.ts.
  - Keep shared brand validators using only shared validation/result modules.

3) Promote UI-facing DTOs to shared
- Create:
  - src/shared/users/dto.ts → move UserDto here; update imports in client code.
  - src/shared/invoices/dto.ts (if needed by client).
  - src/shared/revenues/dto.ts for any client consumption.
- Update server mappers to produce shared DTOs.

4) Remove server imports from features
- Revenues feature:
  - Replace imports of @/server/revenues/entity with shared DTOs or feature-local types.
  - Replace @/server/logging/logger with a shared client-safe logger (no-op or console wrapper).
  - Replace @/server/revenues/utils/template with duplicated or shared client-safe template helpers under src/features/revenues/lib or src/shared/revenues/template.ts if truly cross-cutting.

5) Normalize schemas by layer
- Server-only:
  - src/server/<domain>/schema.ts → zod schemas for server actions, entities, repositories.
- Client-side:
  - src/features/<domain>/schema.client.ts → zod schemas for forms.
- Shared-only when truly common and client-safe (e.g., role enum schema).
- Fill the currently empty files or remove them to avoid confusion.

6) Move security-sensitive constants to server
- Move SALT_ROUNDS to src/server/auth/hashing.ts (or src/server/auth/constants.ts) and update imports.
- Keep SESSION_COOKIE_NAME in server; shared should only export client-needed names if strictly necessary (prefer server-only for cookie name as well).

7) Align validation messages with rules
- Fix emailSchema message or regex in src/features/users/schema.client.ts to match (either @dummy.com or @mail.com).
- Consider removing domain restriction unless required.

8) Introduce client-safe logging facade
- src/shared/logging/logger.ts → export info/warn/error/debug that use console in browser and can be wired to server logger on server.
- Features import from shared logging only.

9) Clarify Entity/DTO/ViewModel shape
- Ensure all server entities use branded ids and strict invariants.
- Mappers: src/server/<domain>/mapper.ts map Entity → DTO (shared) and back when needed.
- Client UIs consume DTOs; feature formatters map to view models when UI-specific shaping or localization is required.

10) Add tests and checks
- Unit tests for:
  - Brand validators and guards in shared.
  - Zod schemas for server and client layers.
  - Mappers Entity↔DTO.
- Enable CI task: pnpm biome-check and eslint to enforce conventions and boundaries.


## Migration Steps (Low-risk sequence)

1. Create shared DTOs
- Move UserDto from src/server/users/dto.ts → src/shared/users/dto.ts
- Update client components to import from shared; leave server mappers producing the same shape.

2. Replace server imports in features
- Revenues feature: copy or extract needed helpers to shared or feature lib.
- Replace server logger with shared logging facade.

3. Fix shared→server import in brands
- Remove dependency on server/errors from src/shared/brands/domain-brands.ts.

4. Tidy schemas
- Fill or remove placeholder files. Keep client-safe schemas in features, server-only schemas in server.

5. Sensitive constants
- Move SALT_ROUNDS to server-only; update imports.

6. ESLint rules
- Add constraints to prevent future regressions.

7. Validation message consistency
- Fix emailSchema message/regex mismatch.


## Quick Rules of Thumb (to document in code review)
- UI (src/ui) never imports from features or server.
- Features (src/features) never import from src/server; they can import server actions as actions, and consume DTOs from src/shared.
- Shared never imports from server.
- Use import "server-only" at top of all server files prone to accidental client import.
- All client-consumed types/DTOs/schemas live in shared or features, not server.


## Optional Future Enhancements
- Introduce a tRPC/REST layer with codegen to derive client types from server contracts in a controlled way.
- Consider project references to build shared first, then server, then features/ui.
- Add a dependency graph check (madge/depcruise) to enforce boundaries in CI.
