# Revenues Actions

This directory contains server actions related to revenue operations in the application. Server actions are part of Next.js and allow direct server-side function execution from client components.

## Overview

The actions in this directory follow Next.js Server Actions pattern to handle revenue-related operations such as:
- Fetching revenue data
- Creating new revenue entries
- Updating existing revenue records
- Deleting revenue records
- Processing revenue calculations and transformations

## File Structure

- `revenue.actions.ts` - Contains server actions for revenue operations

## Server Actions

Server actions in this module are designed to:
1. Handle data mutations and server-side logic related to revenues
2. Provide type-safe interfaces for client components
3. Implement proper error handling using the application's error system
4. Integrate with the revenue repository and services

## Integration Points

The actions in this directory integrate with:
- `revenue.service.ts` - For business logic implementation
- `revenue.repository.ts` - For data access operations
- `revenue.dto.ts` and `revenue.types.ts` - For type definitions
- Error handling from `src/errors/errors.ts`
- Logging via `src/lib/utils/logger.ts`

## Usage Example

```typescript
'use client';

import { createRevenue, fetchRevenueById } from '@/features/revenues/actions/revenue.actions';

// In a client component
async function handleSubmit(formData: FormData) {
  try {
    const result = await createRevenue(formData);
    // Handle successful creation
  } catch (error) {
    // Handle error case
  }
}

// Example of using a server action to fetch data
const RevenueDetails = ({ id }: { id: string }) => {
  const handleRefresh = async () => {
    const data = await fetchRevenueById(id);
    // Update UI with new data
  };

  return (
    <button onClick={handleRefresh}>
      Refresh Revenue Data
    </button>
  );
};
```

## Best Practices

When working with revenue actions:

1. Always use proper error handling with the application's error classes
2. Validate inputs before performing operations
3. Follow the pattern of returning structured responses
4. Use proper logging for monitoring and debugging
5. Keep actions focused on a single responsibility

## Error Handling

All actions in this directory follow the project's error handling conventions:

```typescript
import { DatabaseError, ValidationError } from '@/errors/errors';
import { logger } from '@/lib/utils/logger';

export async function updateRevenue(id: string, data: RevenueUpdateData) {
  try {
    // Implementation
  } catch (error) {
    logger.error({ error, id }, 'Failed to update revenue');
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new DatabaseError('Failed to update revenue', { cause: error });
  }
}
```
