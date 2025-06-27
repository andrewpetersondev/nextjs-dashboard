# e2e problems

## login and signup via ui

1. dB connection
   1. one problem is that the ui is set up to use "dev" database while cypress uses "test" database.
   2. my code sets "dev" as default database and i have not configured getDB() for cypress yet.
   3. this means that e2e tests using ui will be expecting different db contents
   4. TEMP SOLUTION: set the default database to "test" in the codebase, so that cypress tests can run against the same db as the ui.
2. cookie issues

## cy.signup() in auth.cy and signup.cy

- auth.cy.ts does not assert navigation or dashboard, so it passes even if signup fails silently.
- signup.cy.ts asserts navigation and dashboard, so it fails if signup or redirect fails.
