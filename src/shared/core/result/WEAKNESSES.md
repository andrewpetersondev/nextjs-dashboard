Here is a list of weaknesses that have **not** been resolved in the current codebase.

---

### Unresolved Weaknesses

#### Cross-Cutting Items

- **Tree-shaking hints:** Partially present; some helpers missing `/* @__PURE__ */`.
- **Deprecated APIs isolation:** Not implemented (`legacy-result.ts` still co-located and exported).
- **Error mapping casts:** Still present (`as unknown as TError` in async/sync try/catch helpers).
- **Documentation completeness:** Partial; some TSDoc missing full details.
- **Async counterpart utilities expansion:** Not fully implemented (e.g., missing async variants for some helpers).
- **Iterator/lazy collectors:** Not fully implemented; only partial progress.
- **Identity preservation/micro-optimizations:** Not addressed in all places.

---

#### Module-Specific Observations

- **result-async.ts:** Duplication between `tryCatchAsync` and `fromPromise` remains.
- **result-sync.ts:** Same casting pattern; no refinement improvements.
- **result-collect.ts:** `collectTuple` still unions heterogeneous error types (original concern persists).
- **result-map.ts:** No async variants; always re-wraps error branch.
- **result-tap.ts:** No guard around side-effect exceptions in default tap; only present in `tapOkSafe`/`tapErrorSafe`.
- **result-transform.ts:** Only sync `flatMap`; no async variant; same error union pattern.

---

#### Order of importance for refactoring, based on unresolved weaknesses and impact on codebase:

1. `result-async.ts`  
   Contains duplication (`tryCatchAsync` vs `fromPromise`), error mapping casts, and async utility expansion gaps.  
   Central for async error handling and normalization.

2. `result-sync.ts`  
   Has error mapping casts and is foundational for sync error handling.

3. `result-collect.ts`  
   Contains error modeling issues (`collectTuple` unions), impacts aggregation logic.

4. `result-map.ts`  
   Lacks async variants, could benefit from identity-preserving error mapping.

5. `result-transform.ts`  
   Only sync `flatMap`, needs async counterpart and error union refinement.

6. `result-tap.ts`  
   Side-effect error wrapping only in safe variants, could add opt-in guards.

This order prioritizes foundational error handling and normalization, then aggregation, mapping, transformation, and
side-effects.

---

#### Remediation Checklist

- Consolidate async helpers: Not done.
- Isolate deprecated APIs: Not done.
- Add async mapping/transform/tap: Not done for all helpers.
- Strengthen TSDoc: Partial.
- Iterator-based collectors: Not done.

---

#### High-Priority Remaining Gaps

- Remove duplication (`fromPromise` ↔ `tryCatchAsync`).
- Replace unsafe casts with a narrowing utility or enforce mapper return shape.
- Add async counterparts (`flatMapAsync`, `mapOkAsync`, `tapOkAsync`) for all relevant helpers.
- Enhance TSDoc consistency (templates + throws).
- Provide lazy/iterator collectors for large datasets.
- Optional: optimize `mapError` to preserve identity when unchanged.

---

#### Minor Observations

- Add `/* @__PURE__ */` to remaining pure helpers for better tree-shaking.
- Consider identity-preserving branch in `mapError`.
- Optional: add side-effect error wrapping in tap helpers as opt-in.
- Improve `collectTuple` error modeling (homogeneous constraint or error merger).

---

This list focuses only on weaknesses that have not been fully resolved and should be prioritized for future remediation.
