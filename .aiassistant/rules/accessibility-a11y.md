---
apply: manually
patterns: ["src/**/*.tsx"]
---

# Accessibility (A11y) Rules

## Purpose

- Ensure UI is accessible by default with minimal overhead.

## Precedence

- See: project-rules.md (governance)
- See: forms.md (form patterns)

## Rules

1. Every interactive element must be keyboard reachable and operable (Tab/Shift+Tab, Enter/Space).
2. Use semantic HTML first (button, a, label, fieldset, legend, nav, main, header, footer); avoid div roles.
3. Each form control must have a programmatic label (label htmlFor or aria-label/aria-labelledby).
4. Provide alt text for images; if decorative, alt="".
5. Manage focus on navigation and on error; send focus to first error.
6. Ensure color contrast meets WCAG AA; do not rely on color alone to convey meaning.
7. Live regions: use aria-live="polite" for async status updates; avoid aria-busy long-running states.
8. Use role and aria-\* sparingly; prefer native semantics.
9. Announce errors with an aria-describedby on fields and a summary region.
10. Components must not trap focus; use focus guards in modals and return focus on close.

## Low‑Token Playbook (A11y)

- Ask for component ranges only; add labels/aria to specific controls rather than broad rewrites.
- Batch fixes per component; avoid opening entire UI folders.
