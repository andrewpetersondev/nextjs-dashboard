# Result Pattern Utilities

A professional, type-safe implementation of the Result pattern for TypeScript, designed to eliminate exceptions in favor
of explicit error handling.

## Core Philosophy

The `Result` pattern replaces `throw` and `try/catch` with a predictable return type that represents either success (
`Ok`) or failure (`Err`). This promotes:

- **Exhaustiveness**: TypeScript forces you to handle the error case.
- **Discoverability**: Functions explicitly declare what errors they can return.
- **Safety**: No more unhandled runtime exceptions from forgotten catch blocks.

---

## Module Overview

The library is split into logical modules to maintain a clean API and small bundle size:

- `integrations/safe-execute.ts`: Application-level integration for logging and error normalization.
- `result.async.ts`: Asynchronous transformation operators and `pipeAsync`.
- `result.collection.ts`: Utilities for working with arrays or iterables of Results.
- `result.factory.ts`: Creation utilities (Entry points from other data types).
- `result.operators.ts`: Synchronous transformation operators (map, flatMap, tap).
- `result.ts`: Core primitives and type guards.
- `result.types.ts`: Shared TypeScript types and interfaces.

---

## Importing

This project avoids a barrel file. Import directly from the specific module you need:

```typescript
import {Ok, Err, isOk, isErr} from '@/shared/results/result';
import {fromNullable, tryCatch} from '@/shared/results/result.factory';
import {map, flatMap, match} from '@/shared/results/result.operators';
import {mapAsync, pipeAsync, tapAsync} from '@/shared/results/result.async';
import {collectAll, collectTuple} from '@/shared/results/result.collection';
```

---

## Basic Usage

### Creating Results

```typescript
import {Ok, Err} from '@/shared/results/result';

const success = Ok(42);
const failure = Err({code: 'NOT_FOUND', message: 'User not found'});
```

### Checking Results

```typescript
import {isOk, isErr} from '@/shared/results/result';

if (isOk(result)) {
    console.log(result.value);
} else {
    console.error(result.error);
}
```

---

## Factory Utilities (`result.factory.ts`)

Utilities for wrapping existing logic into the Result domain.

```typescript
import {fromNullable, tryCatch} from '@/shared/results/result.factory';

// From a nullable value
const res1 = fromNullable(maybeUser, () => ({code: 'NOT_FOUND', message: '...'}));

// From a throwing function
const res2 = tryCatch(
    () => JSON.parse(jsonString),
    (err) => ({code: 'PARSE_ERROR', message: String(err)})
);
```

---

## Synchronous Operators (`result.operators.ts`)

Transformation utilities that work on Results. Most operators are curried for use in pipelines.

```typescript
import {map, flatMap, tap, match} from '@/shared/results/result.operators';
// import { pipe } from '@/shared/utils/pipe'; // If a pipe utility is available

const result = map(n => n * 2)(Ok(10));

// Extracting values
const output = match(
    result,
    (val) => `Success: ${val}`,
    (err) => `Error: ${err.message}`
);
```

---

## Asynchronous Operators (`result.async.ts`)

Utilities for handling Promises and asynchronous flows.

```typescript
import {mapAsync, pipeAsync, tapAsync} from '@/shared/results/result.async';

const result = await pipeAsync(
    Ok("user_id_123"),
    async (r) => mapAsync(async (id: string) => await fetchUser(id))(r),
    async (r) => tapAsync(async (user: User) => await logVisit(user.id))(r)
);
```

---

## Working with Collections (`result.collection.ts`)

Utilities for processing multiple Results at once.

```typescript
import {collectAll, collectTuple} from '@/shared/results/result.collection';

// Combine an array of Results into a single Result
const results = [Ok(1), Ok(2), Ok(3)];
const allOk = collectAll(results); // Result<readonly number[], AppError>

// Combine heterogeneous Results into a tuple
const tuple = collectTuple(Ok(1), Ok("hello")); // Result<readonly [number, string], AppError>
```

---

## Safe Execution Integration (`integrations/safe-execute.ts`)

A high-level utility for executing operations with automatic logging and normalization.

```typescript
import {safeExecute} from '@/shared/results/integrations/safe-execute';

const result = await safeExecute(
    async () => await myDomainOperation(),
    {
        logger,
        operation: 'GetUserData',
        message: 'Failed to fetch user data'
    }
);
```

---

## Tooling

- Use `pnpm biome:check` to run linting/formatting diagnostics.
- Use `pnpm typecheck` to run TypeScript checks.
