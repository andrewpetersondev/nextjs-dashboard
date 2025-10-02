---
apply: manually
---

# JetBrains AI Assistant Usage

## Prompt Macros

- Bundle selection:
    - “Use bundles: web-app; Additional: testing/e2e. Ignore: docs-only.”

- Review helper:
    - “Insert module checklist for: lang/TYPESCRIPT.md, frameworks/NEXTJS.md.”

## IDE Tips

- Explicit exports; stable symbol names; minimal re-exports for accurate navigation and refactors.
- Avoid magic strings; prefer const objects/enums as single sources of truth.
- Keep functions small for inlay hints and quick fixes.
- Align with IDE intentions: extract function/module, introduce parameter object, add explicit return types.
