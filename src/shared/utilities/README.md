# Shared Utilities - Result Pattern

Comprehensive validation and parsing utilities built on the Result pattern for composable, type-safe error handling.

## Quick Start

### Parsing Numbers

```typescript
import {
  parseIntResult,
  parseFloatResult,
  toNumberResult,
} from "@/shared/utilities/parsing";

const age = parseIntResult("25");
if (age.ok)
  console.log(age.value); // 25
else console.error(age.error.message);
```

### Validating Strings

```typescript
import {
  validateEmail,
  validateMinLength,
} from "@/shared/utilities/validation";

const email = validateEmail("user@example.com");
const password = validateMinLength("MySecure123", 8);
```

### Composing Validators

```typescript
import {
  composeValidators,
  validateNonEmpty,
  validateMinLength,
} from "@/shared/utilities/validation";

const validateUsername = composeValidators([
  (s: string) => validateNonEmpty(s, "Username"),
  (s: string) => validateMinLength(s, 3, "Username"),
]);

const result = validateUsername("alice");
```

## Module Structure

### `/src/shared/utilities/parsing/`

Number and string parsing with Result error handling.

**Functions:**

- `parseIntResult(value, radix?)` - Parse string to integer
- `parseFloatResult(value)` - Parse string to float
- `toNumberResult(value)` - Convert any value to number
- `validatePositive(value)` - Value > 0
- `validateNonNegative(value)` - Value >= 0
- `validateInteger(value)` - Is integer type
- `validateNumberRange(value, min, max)` - Within range

### `/src/shared/utilities/validation/`

Comprehensive validation utilities.

#### Composition (`compose.ts`)

- `composeValidators(validators)` - Sequential validation pipeline
- `pipeValidators(steps)` - Transform and validate pipeline
- `validateObject(validators)` - Validate object fields
- `validateAll(validations)` - Collect independent results
- `validateIf(predicate, validator)` - Conditional validation

#### Strings (`string-validation.ts`)

- `validateNonEmpty(value, fieldName?)` - Non-empty string
- `validateMinLength(value, min, fieldName?)` - Minimum length
- `validateMaxLength(value, max, fieldName?)` - Maximum length
- `validatePattern(value, regex, fieldName?)` - Regex match
- `validateEmail(value)` - Valid email
- `validateUrl(value)` - Valid URL
- `validateAlphanumeric(value, fieldName?)` - Alphanumeric only
- `validateTrimmed(value, fieldName?)` - Trimmed and non-empty
- `validateOneOf(value, allowed, fieldName?)` - Allowed values

#### Arrays (`array-validation.ts`)

- `validateNonEmptyArray(value, fieldName?)` - Non-empty array
- `validateMinArrayLength(value, min, fieldName?)` - Minimum length
- `validateMaxArrayLength(value, max, fieldName?)` - Maximum length
- `validateArrayElements(value, validator, fieldName?)` - Validate elements
- `validateUniqueArray(value, keyFn?, fieldName?)` - Unique elements
- `validateIsArray(value, fieldName?)` - Is array type
- `validateAllElements(value, predicate, fieldName?)` - All pass predicate

#### Type Guards (`type-guards.ts`)

- `validateIsString(value, fieldName?)` - String type
- `validateIsNumber(value, fieldName?)` - Number type (non-NaN)
- `validateIsBoolean(value, fieldName?)` - Boolean type
- `validateIsObject(value, fieldName?)` - Object type (not null/array)
- `validateIsFunction(value, fieldName?)` - Function type
- `validateIsDate(value, fieldName?)` - Valid Date instance
- `validateIsNull(value, fieldName?)` - Null value
- `validateIsUndefined(value, fieldName?)` - Undefined value
- `validateIsDefined(value, fieldName?)` - Not null/undefined
- `validateInstanceOf(constructor, fieldName?)` - Instance type

## Environment Configuration

### Updated Result-based Functions

#### `/src/shared/config/env-utils.ts`

```typescript
import {
  getEnvVariableResult,
  validateEnvResult,
} from "@/shared/config/env-utils";

// Get single env var
const dbUrl = getEnvVariableResult("DATABASE_URL");
if (dbUrl.ok) {
  /* use */
}

// Validate all required vars
const valid = validateEnvResult(["DATABASE_URL", "SESSION_SECRET"]);
```

#### `/src/shared/config/env-shared.ts`

```typescript
import {
  getNodeEnvResult,
  getDatabaseEnvResult,
  getLogLevelResult,
} from "@/shared/config/env-shared";

const nodeEnv = getNodeEnvResult();
const dbEnv = getDatabaseEnvResult();
const logLevel = getLogLevelResult();
```

#### `/src/shared/config/env-public.ts`

```typescript
import {
  getPublicNodeEnvResult,
  getPublicLogLevelResult,
} from "@/shared/config/env-public";

const nodeEnv = getPublicNodeEnvResult();
const logLevel = getPublicLogLevelResult();
```

## Serialization Utilities

### `/src/shared/errors/utils/serialization.utils.ts`

```typescript
import {
  safeStringifyResult,
  safeParseJsonResult,
} from "@/shared/errors/utils/serialization.utils";

// Stringify with error handling
const json = safeStringifyResult(data);

// Parse with error handling
const parsed = safeParseJsonResult<MyType>(jsonString);
```

## Common Patterns

### Pattern 1: Parse and Validate

```typescript
import { flatMap } from "@/shared/result/sync/result-transform";

const parseAge = (input: string) =>
  flatMap((n: number) => validatePositive(n))(parseIntResult(input));

const result = parseAge("25");
```

### Pattern 2: Validate Multiple Fields

```typescript
import { validateAll } from "@/shared/utilities/validation";

const result = validateAll([
  validateEmail("alice@example.com"),
  validateMinLength("password123", 8),
  validatePositive(30),
]);

if (result.ok) {
  const [email, password, age] = result.value;
}
```

### Pattern 3: Complex Object Validation

```typescript
const validateUser = validateObject({
  name: (s: string) => validateNonEmpty(s, "Name"),
  email: (s: string) => validateEmail(s),
  age: (n: number) => validatePositive(n),
});

const result = validateUser({ name: "Alice", email: "alice@ex.com", age: 30 });
```

### Pattern 4: Error Handling

```typescript
import { matchResult, unwrapOr } from "@/shared/result/sync/result-match";

// Pattern matching
const msg = matchResult(
  result,
  (value) => `Success: ${value}`,
  (error) => `Error: ${error.message}`,
);

// Default value
const value = unwrapOr(0)(parseIntResult("invalid"));
```

## Error Details

All validators return `Result<T, AppError>` with rich metadata:

```typescript
{
  ok: false,
  error: AppError {
    code: "validation",
    message: "Password must be at least 8 characters, got 5",
    metadata: {
      actualLength: 5,
      expectedLength: 8,
      fieldName: "Password"
    }
  }
}
```

## Best Practices

### 1. Use Result-returning variants in domain code

```typescript
// ✅ Good - Composable and testable
function processUserAge(input: string): Result<number, AppError> {
  return flatMap((n: number) => validateNumberRange(n, 0, 150))(
    parseIntResult(input),
  );
}

// ❌ Avoid - Try-catch at business logic level
function processUserAge(input: string): number {
  try {
    return parseInt(input);
  } catch (e) {
    throw new Error("Invalid age");
  }
}
```

### 2. Use throwing variants only at boundaries

```typescript
// ✅ Acceptable - At application startup
const nodeEnv = getNodeEnv(); // throws if invalid

// ✅ Better - For optional config
const nodeEnv = getNodeEnvResult();
if (!nodeEnv.ok) {
  logger.warn("Invalid NODE_ENV, using default");
}
```

### 3. Compose validators for complex scenarios

```typescript
// ✅ Good - Clear, composable chain
const validator = pipeValidators([
  (s: string) => validateNonEmpty(s),
  (s: string) => validateMinLength(s, 8),
  (s: string) => validatePattern(s, /[A-Z]/),
]);

// ✅ Also good - Explicit sequence
const validatePassword = (p: string) =>
  flatMap((s: string) => validateMinLength(s, 8))(
    flatMap((s: string) => validateNonEmpty(s))(Ok(p)),
  );
```

### 4. Leverage type safety

```typescript
// ✅ Good - Type inference works with Results
const results = [parseIntResult("1"), parseIntResult("2"), parseIntResult("3")];
const allOk = collectAll(results); // Type: Result<readonly number[], AppError>

// ✅ Type narrowing with guards
const user = validateIsObject(data);
if (user.ok) {
  // user.value is now Record<string, unknown>
}
```

## Migration Guide

### From try-catch to Result

Before:

```typescript
try {
  const age = parseInt(userInput);
  if (age < 0) throw new Error("Age must be positive");
  return age;
} catch (e) {
  throw new AppError("validation", { message: String(e) });
}
```

After:

```typescript
const ageResult = flatMap((n: number) => validatePositive(n))(
  parseIntResult(userInput),
);
```

### From validation functions returning booleans

Before:

```typescript
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

if (!isValidEmail(email)) {
  throw new Error("Invalid email");
}
```

After:

```typescript
const emailResult = validateEmail(email);
if (!emailResult.ok) {
  logger.error(emailResult.error.message);
}
```

## Testing

All validators can be tested with simple Result assertions:

```typescript
describe("parseIntResult", () => {
  it("parses valid integers", () => {
    const result = parseIntResult("42");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe(42);
  });

  it("returns error for invalid input", () => {
    const result = parseIntResult("not a number");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("validation");
    }
  });
});
```

## Related Documentation

- [Result Pattern Examples](./result-pattern-examples.md) - Comprehensive usage guide
- [Result Pattern Implementation](./result-pattern-implementation.md) - Architecture and design
- [Shared Folder Structure](./project-structure.md) - Overall organization
