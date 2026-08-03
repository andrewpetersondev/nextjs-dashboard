# Time

## Purpose

Shared time constants and second/millisecond conversion helpers.

## Boundaries

One flat, universal file: `time.constants.ts` — UI timing constants
(`DEBOUNCE_MS`, `ALERT_AUTO_HIDE_MS`, `TYPING_MS`) and `nowInSeconds` +
seconds/milliseconds converters used by session timing.

## Import Rules

- MAY import from `@/shared/core/**`
- MUST NOT import from `@/modules/**`
