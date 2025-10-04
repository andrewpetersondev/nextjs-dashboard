# shared/logging

Structured logging utilities for application events and errors.

## Overview

- Functions for logging messages, errors, and context in a structured format.
- Normalize error shapes and avoid leaking sensitive information.
- All utilities are strictly typed and documented.

## Usage Example

```ts
import {logInfo, logError} from './logger';

logInfo('User login', {userId: 'abc123'});
logError('Database error', {error});
```

