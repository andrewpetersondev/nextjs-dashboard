# Revenues Feature

Purpose
- Maintain monthly revenue aggregates derived from invoices.
- Provide rolling 12-month revenue data and statistics for display.
- Keep aggregates consistent via event-driven updates on invoice lifecycle events.

Public API (no barrels)
- Services
    - `@/server/revenues/services/revenue.service` (coordinates repository operations)
    - `@/server/revenues/services/revenue-statistics.service` (rolling window + stats)
- Actions
    - `@/server/revenues/actions/actions` (server action to fetch rolling 12-month chart + stats)
- Repository Contracts and Implementation
    - `@/server/revenues/repository/interface` (contract)
    - `@/server/revenues/repository/repository` (current implementation)
- Events
    - `@/server/revenues/events/revenue-event.handler` (subscribes to invoice events)
    - `@/server/revenues/events/bootstrap/revenue-events.bootstrap` (one-time handler registration)

Event Flow (high level)
- Invoice Created/Updated/Deleted -> EventBus -> RevenueEventHandler
- Handler uses application/orchestrator to enforce:
    - idempotency (application/idempotency)
    - policy/eligibility (application/policy + events/common/guards)
    - error/logging concerns (application/logging)
- Handler delegates to event-specific core and mutations/upsert logic to persist via repository.

Idempotency & Policies
- Idempotency: in-process guard ensures an event ID is processed once per process lifetime.
- Policies: extract and validate `Period` from invoice; only eligible invoices affect revenue.

Layering
- domain/: entity types and pure helpers.
- application/: orchestrator, policies, idempotency, logging, transactions (boundary abstraction).
- mappers/: db/display mappers for transforming rows/entities.
- repository/: repository interface and concrete implementation.
- services/: business services (revenue, statistics).
- events/: consistent structure with common/, process-invoice/, status-change/, deleted-invoice/.
- actions/: server actions for fetching data for UI.
- utils/ and validation/: internal helpers and validators.
- types/: shared result and helper types.

Notes
- No barrel files: import concrete modules directly as shown above.
- Strict TypeScript types everywhere; functions/files kept small to maintain clarity.
