# Revenues Shared

Purpose:
- Cross-cutting helpers within the Revenues bounded context only.
- Organize by:
  - `errors/` — domain/application-specific error classes and mappers.
  - `types/` — shared TypeScript types/interfaces.
  - `utils/` — small pure helpers used across layers.

Notes:
- Keep modules small and strictly typed; prefer readonly types.
- No barrel files. Do not move existing code yet; migrate later.
