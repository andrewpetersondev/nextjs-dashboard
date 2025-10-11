---
apply: always
---

# Current Focus

If there are any bad practices, poor organization, etc. I want to fix it. To do this, I will need to strengthen my logic
for forms, results, and errors.

Focus on code related to:

Favor code in src/shared/forms/types/form-result.types.ts over similar code in other locations.

- form types, helpers, adapters, etc
    - src/shared/forms
    - src/server/forms
- result types, helpers, adapters, etc
    - src/shared/core/result
- error flows
    - src/shared/core/errors
    - src/server/errors/
- writing maintainable code
- result & form & error cohesion

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
