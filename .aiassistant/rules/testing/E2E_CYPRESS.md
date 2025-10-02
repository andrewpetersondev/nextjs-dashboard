---
apply: manually
---

---
tags: [testing, e2e, cypress, accessibility]
scope: Cypress tests and CI runs
---

# E2E & Accessibility Testing Rules

- Structure:
    - Deterministic tests, isolated state; fixtures/factories for setup.
    - Prefer data-testid selectors; avoid brittle DOM selectors.
- Accessibility:
    - Integrate axe-core via cypress-axe for key pages and flows.
- CI:
    - Run smoke suite on PR; full suite on main/nightly.
    - Record videos/artifacts on failure; keep retries minimal and justified.
