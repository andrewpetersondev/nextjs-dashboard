---
description: Run the Cypress e2e suite (report-only)
allowed-tools: Bash(pnpm cy:e2e)
disallowed-tools: Edit, Write, NotebookEdit
---

Run `pnpm cy:e2e`. This boots a test server and runs the Cypress e2e specs against it. It requires `.env.test.local` to be present — if it is missing, the run fails at startup; report that clearly and do not retry. Report failures with spec name, the failing assertion, and any server or seed errors. Do not attempt to fix anything — just report.
