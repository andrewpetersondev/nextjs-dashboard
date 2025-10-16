---
apply: manually
patterns: ["src/app/**", "src/**/*.server.ts", "src/**/*.ts"]
---

# Next.js Performance & Caching Rules

## Purpose

- Ensure efficient data fetching, caching, and rendering in Next.js App Router with type safety.

## Precedence

- See: project-rules.md (governance)
- See: typescript-rules.md (coding constraints)

## Rules

1. Default to Server Components; mark Client Components with "use client" only when needed.
2. All fetches must declare caching explicitly: revalidate (seconds), cache: "force-cache"|"no-store", or tags.
3. Use cache tags for invalidation; group related resources by stable tag constants.
4. Use typed fetch wrappers; thread AbortSignal; JSON must be schema-validated at boundaries.
5. Avoid waterfalls: batch parallel independent fetches with Promise.all; set stable cache keys.
6. Only pass serializable props across RSC boundaries; avoid class instances/functions in props.
7. For server actions, validate input (Zod), perform work in services, and return minimal Result/AppError.
8. Prefer edge runtime only when needed; ensure APIs and libraries are edge-compatible first.
9. Image optimization: use next/image with explicit width/height and alt; avoid unbounded sizes.
10. Measure: add simple timings/logs in dev; remove noisy logs before commit.

## Low‑Token Playbook (Perf)

- Ask for specific component/server action ranges to adjust caching headers.
- Batch cache tag additions and constants in one edit.
- Use search_project to update imports/usages of cache helpers in one pass.
