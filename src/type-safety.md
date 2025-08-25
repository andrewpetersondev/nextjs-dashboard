Short answer: Keep entities in the server layer, keep DTOs in a shared “API contract” layer (not in features), and keep UI-specific view/form types in features. That gives you stronger type safety, cleaner boundaries, and avoids invalid imports.

Recommended layering
- Server/domain
    - Entities: rich domain types, dates/brands, invariants.
    - Mappers: entity <-> dto.
    - Services/repositories use entities internally and map at boundaries.

- Shared (API contract, framework-agnostic)
    - DTOs: plain, JSON-serializable types (no Date, no branded DB IDs unless they serialize cleanly).
    - Cross-cutting domain primitives and enums/constants, e.g. InvoiceStatus, brands, value objects that are safe on both client and server.
    - Validation schemas that must be used on both client and server can live here if framework-agnostic.

- Features/UI
    - View models and form types: shapes tailored to the UI (e.g., strings for inputs, derived fields, display-only properties).
    - Components/hooks. Do not import server code.
    - Map DTOs -> view/form types at the boundary to keep UI shapes ergonomic.

Why not put DTOs in features?
- DTOs are contracts used by both server and UI. Housing them in features makes the server depend on a UI folder, inverting dependencies. It also makes reuse across features awkward.
- Your lint rules disallow features importing server. Currently, some components import UserDto from server; moving DTOs to shared resolves that violation and improves ergonomics.

Practical guidelines
- Entities: server-only. Rich types, branded IDs, Dates.
- DTOs: shared. Plain, serializable, minimal. Stable contract between server and UI.
- View/Form types: features. UI-friendly shapes (e.g., money as string, radio values), may differ from DTOs.
- Mapping:
    - server: entity <-> dto
    - features: dto <-> view/form
- Keep dependency direction inward: features -> shared, server -> shared. Shared imports nothing from features/server.

When to put a type in shared vs features
- Put in shared if:
    - It’s used by both server and UI (DTOs, enums like InvoiceStatus, brands/IDs, utility types).
    - It’s framework-agnostic and serializable.

- Keep in features if:
    - It’s only used by UI and tailored to UI concerns (form state, UI view models).

- Keep in server if:
    - It encodes domain behavior/invariants or relies on server-only constructs.

Migration plan
- Move DTOs used by UI from server to shared (e.g., src/shared/invoices/dto.ts, src/shared/users/dto.ts).
- Update server services/repos to import DTOs from shared.
- Ensure DTOs remain plain and serializable (no Dates; use strings).
- Keep entities in server and maintain mappers.
- In features, replace imports from server/* with shared/* and, where needed, introduce view/form types and mappers from DTO to UI shape.

This setup maximizes type safety, enforces clean boundaries, and aligns with your linting rules and Next.js client/server split. My name is AI Assistant.
