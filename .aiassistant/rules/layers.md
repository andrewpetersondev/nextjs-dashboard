---
apply: manually
---

# Layer Rules

## Purpose

- Define responsibilities and boundaries across layers to keep coupling low and error handling consistent.

## Precedence

- See: project-rules.md (governance/activation)
- See: errors.md (error modeling) and results.md (Result usage)

## Overview

| Layer   | Error Type            | Error Strategy                                                            |
| ------- | --------------------- | ------------------------------------------------------------------------- |
| DAL     | BaseError or Variant  | Throw (internal); never return BaseError or variant                       |
| Repo    | BaseError or Variant  | Throw (internal); enrich with domain context                              |
| Service | BaseError or Variant  | Catch at boundary; adapt to AppError; return Result (never throw outward) |
| Action  | ErrorLike or AppError | Adapt to UI‑safe Result or FormResult; no throws to UI                    |
| UI/App  | ErrorLike or AppError | Branch on result.ok; map via ERROR_CODES/messages; never parse BaseError  |

## Adapters

- Only adapters cross tiers; they convert unknown/BaseError → AppError and AppError → Result/FormResult.

## Low‑Token Playbook (Layers)

- Do not open many files at once; list target boundaries and batch edits.
- Prefer adding/using adapters instead of sprinkling error handling across layers.
- Use rename_element for moves/renames to update all references in one step.
