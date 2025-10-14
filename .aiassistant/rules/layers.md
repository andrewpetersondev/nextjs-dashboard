---
apply: off
---

# Layer Rules

## Special Instructions For This File

These rules are neither absolute nor complete. Use professional judgement.

## Overview

| Layer   | Error Type            | Error Strategy                                                            | Return Type | Return Strategy |
| ------- | --------------------- | ------------------------------------------------------------------------- | ----------- | --------------- |
| DAL     | BaseError or Variant  | Throw (internal); never return BaseError or variant                       | Row or null |
| Repo    | BaseError or Variant  | Throw (internal); enrich with domain context                              |
| Service | BaseError or Variant  | Catch at boundary; adapt to AppError; return Result (never throw outward) |
| Action  | ErrorLike or AppError | Adapt to UI‑safe Result or FormResult; no throws to UI                    |
| UI/App  | ErrorLike or AppError | Branch on result.ok; map via ERROR_CODES/messages; never parse BaseError  |

## Adapters
