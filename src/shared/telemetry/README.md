# Telemetry

## Purpose

Structured logging and lightweight performance measurement for server code —
the `logger` every action/DAL routes through (Biome's `noConsole` enforces
this) and the `PerformanceTracker` used by auth workflows.

## Boundaries

- `core/` — `PerformanceTracker` (measure named operations, total duration).
- `logging/core/` — the logger contract + DTOs.
- `logging/infrastructure/` — `logging.client.ts` (the shared `logger`),
  base logger, levels, mappers.
- `logging/application/` — transaction-scoped logging use-case + context
  tokens.
- `logging/redaction/` — key-based redaction of sensitive fields before
  anything is written; extend `redaction.constants.ts` when adding new
  secret-bearing fields.

## Import Rules

- MAY import from `@/shared/core/**`
- MUST NOT import from `@/modules/**`
