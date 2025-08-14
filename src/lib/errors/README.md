# Error Handling Directory

This directory contains the error classes used in the application. Each error class is designed to handle specific error scenarios, providing a consistent way to manage and report errors throughout the codebase.

## Files

### `errors.ts`

This file exports custom error classes used throughout the application. These classes extend the native JavaScript `Error` class with additional properties and methods for consistent error handling.

- Provides a hierarchy of error types specific to the application domain
- Enables error classification, making it easier to respond appropriately based on error type
- Integrates with the logging system (via `src/lib/utils/logger.ts`)

**Usage Example:**
```typescript
import { NotFoundError, ValidationError } from '@/errors/errors';

// Throw domain-specific errors
if (!user) {
  throw new NotFoundError('User not found');
}

if (!isValidInput(data)) {
  throw new ValidationError('Invalid input data');
}
```

### `error-messages.ts`

This file contains centralized error message constants and error message generation functions. Centralizing error messages helps maintain consistency in error reporting and simplifies localization efforts.

- Provides standardized error messages for common error scenarios
- May include message formatting functions for dynamic error messages
- Separates error message content from error handling logic

**Usage Example:**
```typescript
import { ERROR_MESSAGES } from '@/errors/error-messages';
import { ValidationError } from '@/errors/errors';

function validateUser(user: unknown): void {
  if (!user) {
    throw new ValidationError(ERROR_MESSAGES.USER.REQUIRED);
  }
}
```

## Integration with Logging

Error classes in this directory are designed to work with the application's logging system. When throwing errors, they automatically include appropriate metadata for logging:

```typescript
import { DatabaseError } from '@/errors/errors';
import { logger } from '@/lib/utils/logger';

try {
  // Database operation
} catch (error) {
  // The error will be properly formatted for logging
  const dbError = new DatabaseError('Failed to query database', { cause: error });
  logger.error(dbError);
  throw dbError;
}
```

## Best Practices

1. Always use the appropriate error class from `errors.ts` rather than throwing generic errors
2. Include meaningful error messages that help identify the issue
3. Utilize error messages from `error-messages.ts` for consistency
4. Pass the original error as the `cause` when wrapping errors
5. Include relevant context data in the error object when applicable

## Error Handling Flow

The application follows a structured approach to error handling:

1. Throw domain-specific errors from `errors.ts` at the source of the problem
2. Catch errors at appropriate boundaries (API routes, React components, etc.)
3. Log errors with context using the `logger` from `src/lib/utils/logger.ts`
4. Transform errors to appropriate responses (UI messages, HTTP status codes, etc.)

For client-side error handling, implement React Error Boundaries to catch and display errors gracefully.
