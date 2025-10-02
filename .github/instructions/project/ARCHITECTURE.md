---
apply: manually
---

# Architecture & Organization

- Layering:
    - src/shared/: import only from src/shared/
    - src/features/: import from src/features/ and src/shared/
    - src/server/: no import restrictions
- Practices:
    - Separate validation, transformation, and side-effects.
    - Explicit, minimal exports; avoid “god” modules and dumping grounds.
