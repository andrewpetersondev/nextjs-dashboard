---
applyTo: '**'
description: 'description'
---

# Coding Style

- Single-purpose functions; ≤50 lines.
- Parameters ≤4; use options object for optional params.
- File length ≤200 lines; split large files by feature/domain.
- Extract predicates/utilities; avoid deep nesting and excessive branching.
- Prefer standard utility types; avoid custom wrappers when not needed.
- Use type-only imports (import type).
- Avoid dumping grounds (utils.ts); prefer small, named modules.
- Treat inputs as immutable; use readonly arrays/tuples.
- Avoid in-place mutations; prefer spreads or structuredClone.
- Mark constants with as const for literal types.
- Avoid barrel files; prefer explicit imports.
- Use biome for formatting and linting; sort objects by keys.
