# E2E Testing Checklist

A practical, minimal checklist to ensure reliable, high-value end-to-end coverage.

## 1) Environment & Test Data
- [ ] Dedicated test environment (stable URLs, seeded DB)
- [ ] Clear, deterministic test data (fixtures or API seeding)
- [ ] Idempotent setup/teardown (can re-run without manual cleanup)
- [ ] Environment variables managed via .env (no secrets in code)
- [ ] Feature flags set to known states

## 2) Smoke Path (Happy Path)
- [ ] App loads (no console errors, critical APIs healthy)
- [ ] Authentication flow (login, session persistence, logout)
- [ ] Primary user journey (core business flow) completes
- [ ] Critical pages render with essential data
- [ ] Global navigation and routing work (deep links included)

## 3) Core CRUD Flows
- [ ] Create: form validation, success persistence
- [ ] Read: list and detail views reflect server state
- [ ] Update: edits persist and are reflected immediately
- [ ] Delete: confirmation shown, item removed consistently
- [ ] Empty states and loading states verified

## 4) Error Handling & Resilience
- [ ] API errors show user-friendly messages
- [ ] Network failures/timeouts handled gracefully
- [ ] Unauthorized/forbidden paths redirect or display proper UI
- [ ] 404 and 500 pages render with recovery paths

## 5) Accessibility (Baseline)
- [ ] Page has a single H1 and proper landmarks
- [ ] Interactive elements are keyboard reachable
- [ ] Focus management on modal open/close and route changes
- [ ] Axe checks run on key pages (no serious violations)

## 6) Performance Signals (Lightweight)
- [ ] Initial page interactive within acceptable time
- [ ] Avoid excessive spinners; show skeletons where appropriate
- [ ] No major blocking requests; lazy-load heavy parts

## 7) Cross-Browser/Device (Targeted)
- [ ] Latest Chrome
- [ ] One WebKit/Safari target
- [ ] One Firefox target
- [ ] Mobile viewport sanity check for core flows

## 8) Security Basics (UI-Level)
- [ ] No sensitive data in URL/query strings
- [ ] Log out clears session and prevents back-button access
- [ ] CSRF/auth flows behave as expected (tokens/cookies present)

## 9) Observability & Logging
- [ ] Console free of uncaught errors in happy-path tests
- [ ] Network calls asserted where critical (status, payload)
- [ ] Screenshots/video on failures captured in CI artifacts

## 10) CI Pipeline Integration
- [ ] Tests run headless in CI with repeatable seed
- [ ] Parallelization/sharding configured if suite grows
- [ ] Retry policy for flaky tests (limited, with root-cause follow-up)
- [ ] Reports uploaded (JUnit/MochaJSON) and surfaced in CI

## 11) Cypress-Specific Hygiene
- [ ] Use data-testid or stable selectors (no brittle CSS/xpath)
- [ ] Avoid arbitrary cy.wait(times) — prefer waiting on aliases
- [ ] Use cy.intercept to control/observe network where needed
- [ ] Custom commands abstract repeated steps (login, createEntity)
- [ ] Before/after hooks reset state per spec or per test as needed

## 12) Flakiness Prevention
- [ ] Assertions retry implicitly (Cypress default)
- [ ] UI waits on visible/attached/contains before interacting
- [ ] Time-dependent tests stabilized (fake timers or controlled clocks)
- [ ] Test data isolation prevents cross-test interference

## 13) Release/Regression Safety Net
- [ ] Smoke test suite completes under a few minutes
- [ ] Covers top revenue/user-impact paths
- [ ] Rollback/feature flag off-ramp validated

---
How to use:
- Start with smoke + happy path + auth + critical CRUD.
- Add one resilience and one accessibility check per new feature.
- Keep selectors stable and avoid arbitrary waits.
