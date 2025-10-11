---
apply: off
---

# Current Focus

Instructions

- If there are any bad practices, poor organization, etc., I want to fix it. To do this, I will need to strengthen my
  logic for forms, results, and errors.

Goals

- find problems, flaws, mistakes in result code
- code for returning results and throwing errors
- result utilities with mappers/adapters
- writing maintainable code
- result & form & error cohesion

Focus on code related to:

- result types, helpers, adapters, etc
    - src/shared/core/result/
    - src/shared/core/result/result.ts
    - src/shared/core/result/async
    - src/shared/core/result/iter
    - src/shared/core/result/sync
- error flows
    - src/shared/core/errors
    - src/server/errors/
    - src/shared/core/result/app-error.ts
- form types, helpers, adapters, etc
    - src/shared/forms
    - src/server/forms

Secondary focus on:

- organization
- reusable code
- removing duplication

Ignore:

- src/features/customers/
- src/server/customers/
- src/features/invoices/
- src/server/invoices/
- src/features/revenues/
- src/server/revenues/
- src/features/users/
- src/server/users/

_Last updated: 2025-10-11_
