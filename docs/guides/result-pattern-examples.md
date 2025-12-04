# Result Pattern Integration Examples

This document demonstrates how to use the Result pattern utilities throughout the shared folder.

## Environment Configuration

### Using Result-returning environment functions

```typescript
import {
  getEnvVariableResult,
  validateEnvResult,
} from "@/shared/config/env-utils";
import {
  getNodeEnvResult,
  getLogLevelResult,
} from "@/shared/config/env-shared";
import { getPublicNodeEnvResult } from "@/shared/config/env-public";

// Get environment variable with Result
const dbUrlResult = getEnvVariableResult("DATABASE_URL");
if (dbUrlResult.ok) {
  console.log("Database URL:", dbUrlResult.value);
} else {
  console.error("Error:", dbUrlResult.error.message);
}

// Validate environment on startup
const envValidation = validateEnvResult(["DATABASE_URL", "SESSION_SECRET"]);
if (!envValidation.ok) {
  console.error("Environment validation failed:", envValidation.error.message);
  process.exit(1);
}

// Get typed environment values
const nodeEnvResult = getNodeEnvResult();
const logLevelResult = getLogLevelResult();
```

## JSON Serialization

### Safe JSON operations with Result

```typescript
import {
  safeStringifyResult,
  safeParseJsonResult,
} from "@/shared/errors/utils/serialization.utils";

// Stringify with error handling
const data = { name: "Alice", age: 30 };
const jsonResult = safeStringifyResult(data);
if (jsonResult.ok) {
  console.log("JSON:", jsonResult.value);
}

// Parse with error handling
const parseResult = safeParseJsonResult<{ name: string; age: number }>(
  '{"name":"Alice","age":30}',
);
if (parseResult.ok) {
  console.log("Parsed:", parseResult.value.name);
}

// Handle circular references gracefully
const circular: any = {};
circular.self = circular;
const circularResult = safeStringifyResult(circular);
if (!circularResult.ok) {
  console.error(
    "Cannot stringify circular object:",
    circularResult.error.message,
  );
}
```

## Number Parsing and Validation

### Parse and validate numbers

```typescript
import {
  parseIntResult,
  parseFloatResult,
  toNumberResult,
} from "@/shared/utilities/parsing";
import {
  validatePositive,
  validateNumberRange,
  validateInteger,
} from "@/shared/utilities/parsing";
import { flatMap } from "@/shared/result/sync/result-transform";

// Parse integer
const ageResult = parseIntResult("25");
if (ageResult.ok) {
  console.log("Age:", ageResult.value);
}

// Parse and validate in a pipeline
const validatedAge = flatMap((n: number) => validateNumberRange(n, 0, 150))(
  parseIntResult("25"),
);

// Compose multiple validations
const parseAndValidatePrice = (input: string) =>
  flatMap((n: number) => validatePositive(n))(parseFloatResult(input));

const priceResult = parseAndValidatePrice("19.99");
```

## String Validation

### Validate string inputs

```typescript
import {
  validateNonEmpty,
  validateEmail,
  validateMinLength,
  validatePattern,
  validateUrl,
} from "@/shared/utilities/validation";
import { composeValidators } from "@/shared/utilities/validation";

// Single validation
const nameResult = validateNonEmpty("Alice", "Name");

// Email validation
const emailResult = validateEmail("alice@example.com");

// Compose multiple string validations
const validatePassword = composeValidators([
  (s: string) => validateNonEmpty(s, "Password"),
  (s: string) => validateMinLength(s, 8, "Password"),
  (s: string) =>
    validatePattern(s, /[A-Z]/, "Password (must contain uppercase)"),
  (s: string) => validatePattern(s, /[0-9]/, "Password (must contain number)"),
]);

const passwordResult = validatePassword("SecurePass123");
```

## Array Validation

### Validate arrays and their elements

```typescript
import {
  validateNonEmptyArray,
  validateArrayElements,
  validateUniqueArray,
  validateMinArrayLength,
} from "@/shared/utilities/validation";
import { parseIntResult } from "@/shared/utilities/parsing";

// Validate array is non-empty
const tagsResult = validateNonEmptyArray(["typescript", "nodejs"], "Tags");

// Validate each element
const numbersResult = validateArrayElements(
  ["1", "2", "3"],
  (item, index) => parseIntResult(item),
  "Numbers",
);

// Ensure unique elements
const uniqueTagsResult = validateUniqueArray(
  ["a", "b", "c"],
  (tag) => tag,
  "Tags",
);

// Compose array validations
import { composeValidators } from "@/shared/utilities/validation";

const validateTags = composeValidators([
  (arr: string[]) => validateNonEmptyArray(arr, "Tags"),
  (arr: string[]) => validateMinArrayLength(arr, 1, "Tags"),
  (arr: string[]) => validateUniqueArray(arr, (t) => t, "Tags"),
]);
```

## Type Guards

### Runtime type validation

```typescript
import {
  validateIsString,
  validateIsNumber,
  validateIsObject,
  validateIsDefined,
} from "@/shared/utilities/validation";
import { flatMap } from "@/shared/result/sync/result-transform";

// Validate type and then process
const processUnknown = (value: unknown) =>
  flatMap((s: string) => validateNonEmpty(s, "Input"))(
    validateIsString(value, "Input"),
  );

// Validate object structure
const validateUser = (data: unknown) =>
  flatMap((obj: Record<string, unknown>) => {
    const nameResult = validateIsString(obj.name, "name");
    const ageResult = validateIsNumber(obj.age, "age");

    if (!nameResult.ok) return nameResult;
    if (!ageResult.ok) return ageResult;

    return Ok({ name: nameResult.value, age: ageResult.value });
  })(validateIsObject(data, "User"));
```

## Complex Validation Pipelines

### Combine multiple validators

```typescript
import { pipeValidators, validateObject } from "@/shared/utilities/validation";
import { parseIntResult } from "@/shared/utilities/parsing";
import {
  validatePositive,
  validateNumberRange,
} from "@/shared/utilities/parsing";

// Pipeline: parse -> validate positive -> validate range
const parseAge = pipeValidators([
  (s: string) => parseIntResult(s),
  (n: number) => validatePositive(n),
  (n: number) => validateNumberRange(n, 0, 150),
]);

const ageResult = parseAge("25");

// Validate entire object
const validateUserInput = validateObject({
  name: (s: string) => validateNonEmpty(s, "Name"),
  email: (s: string) => validateEmail(s),
  age: (n: number) => validatePositive(n),
});

const userResult = validateUserInput({
  name: "Alice",
  email: "alice@example.com",
  age: 30,
});
```

## Error Handling Patterns

### Work with Result values

```typescript
import {
  matchResult,
  unwrapOr,
  unwrapOrElse,
} from "@/shared/result/sync/result-match";
import { tapError } from "@/shared/result/sync/result-tap";

// Pattern matching
const result = parseIntResult("42");
const message = matchResult(
  result,
  (value) => `Success: ${value}`,
  (error) => `Error: ${error.message}`,
);

// Provide default value
const age = unwrapOr(0)(parseIntResult("invalid"));

// Compute fallback
const computed = unwrapOrElse((err) => {
  console.error("Parse failed:", err.message);
  return 0;
})(parseIntResult("invalid"));

// Side effects on error
const resultWithLogging = tapError((err) => {
  console.error("Validation failed:", err.message);
})(validateEmail("not-an-email"));
```

## Collecting Multiple Results

### Validate multiple values

```typescript
import { collectAll, collectTuple } from "@/shared/result/sync/result-collect";
import { validateAll } from "@/shared/utilities/validation";

// Collect array of results
const results = [parseIntResult("1"), parseIntResult("2"), parseIntResult("3")];
const collected = collectAll(results);
if (collected.ok) {
  console.log("All values:", collected.value); // [1, 2, 3]
}

// Collect tuple with different types
const tuple = collectTuple(
  validateEmail("alice@example.com"),
  parseIntResult("30"),
  validateUrl("https://example.com"),
);
if (tuple.ok) {
  const [email, age, url] = tuple.value;
}

// Using validateAll utility
const allResults = validateAll([
  parseIntResult("10"),
  parseFloatResult("3.14"),
  toNumberResult("42"),
]);
```

## Async Operations

### Work with async Results

```typescript
import { tryCatchAsync, fromPromise } from "@/shared/result/async/result-async";
import { mapOkAsync } from "@/shared/result/async/result-map-async";

// Wrap async operation
const fetchDataResult = await tryCatchAsync(
  async () => {
    const response = await fetch("https://api.example.com/data");
    return response.json();
  },
  (error) =>
    new AppError("infrastructure", {
      message: "Failed to fetch data",
      originalCause: error,
    }),
);

// Convert promise to Result
const promiseResult = await fromPromise(
  fetch("https://api.example.com"),
  (error) => new AppError("infrastructure", { originalCause: error }),
);

// Map async Result
const processedResult = await mapOkAsync(async (data) => {
  // async transformation
  return processData(data);
})(fetchDataResult);
```

## Best Practices

1. **Prefer Result-returning functions** in domain logic for composability
2. **Use throwing variants** only at application boundaries (startup, CLI)
3. **Compose validations** using `flatMap`, `composeValidators`, or `pipeValidators`
4. **Collect multiple validations** with `collectAll` or `collectTuple`
5. **Handle errors explicitly** with `matchResult`, `unwrapOr`, or `tapError`
6. **Leverage type safety** - Result types preserve full error information
7. **Document error cases** in function TSDoc comments
