# Revenues Domain / Repositories (Interfaces)

Purpose:
- Define repository interfaces for aggregates/entities (e.g., RevenueRepository).
- Declare persistence-agnostic contracts used by application services.

Notes:
- Interfaces only; implementations belong to `infrastructure/persistence`.
- Do not add barrel files. Do not move existing code yet; migrate later.
