# Revenues Infrastructure / Persistence

Purpose:
- Implement repository interfaces using concrete persistence (e.g., SQL/ORM/Drizzle).
- Include entity mappers and transaction management adapters.

Notes:
- Keep persistence-specific details here; do not leak to domain/application.
- No barrel files. Do not move existing code yet; migrate implementations later.
