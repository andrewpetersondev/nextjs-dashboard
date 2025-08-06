# Revenues Repository

This directory contains the repository layer for the revenue feature. The repository pattern provides a clean abstraction over data access operations, isolating the domain model from data persistence concerns.

## Overview

The repository layer handles:
- Data access operations for revenue entities
- Persistence logic (CRUD operations)
- Data mapping between database models and domain entities
- Transaction management
- Query operations

## Files

### `revenue.repository.interface.ts`

Defines the contract for the revenue repository through the `RevenueRepositoryInterface`:

- Specifies all available revenue data operations
- Ensures consistent implementation across different repository implementations
- Enables dependency injection and testability through abstraction
- Provides a comprehensive set of methods for revenue data management

**Key Methods:**

| Method | Purpose | Parameters | Return Type |
|--------|---------|------------|-------------|
| `create` | Creates a new revenue record | `revenue: RevenueCreateEntity` | `Promise<RevenueEntity>` |
| `read` | Retrieves a revenue record by ID | `id: RevenueId` | `Promise<RevenueEntity>` |
| `update` | Updates an existing revenue record | `id: RevenueId, revenue: RevenuePartialEntity` | `Promise<RevenueEntity>` |
| `delete` | Deletes a revenue record by ID | `id: RevenueId` | `Promise<void>` |
| `findByDateRange` | Finds revenue records within a date range | `startPeriod: Period, endPeriod: Period` | `Promise<RevenueEntity[]>` |
| `upsert` | Creates or updates a revenue record | `revenue: RevenueCreateEntity` | `Promise<RevenueEntity>` |
| `findByPeriod` | Finds a revenue record by period | `period: Period` | `Promise<RevenueEntity \| null>` |
| `upsertByPeriod` | Creates or updates a revenue record by period | `period: Period, revenue: RevenuePartialEntity` | `Promise<RevenueEntity>` |

**Usage Example:**
```typescript
import { RevenueRepositoryInterface } from '@/features/revenues/repository/revenue.repository.interface';
import type { Period, RevenueId } from "@/lib/definitions/brands";

// In a service class
class RevenueService {
  constructor(private readonly revenueRepository: RevenueRepositoryInterface) {}

  // Using the repository through its interface
  async getRevenueById(id: RevenueId) {
    return this.revenueRepository.read(id);
  }

  // Finding revenue by period
  async getRevenueByPeriod(period: Period) {
    return this.revenueRepository.findByPeriod(period);
  }
}
```

### `revenue.repository.ts`

Implements the `RevenueRepositoryInterface` with concrete data access logic using Drizzle ORM:

- Contains actual database queries and operations for revenue data
- Handles data mapping between database rows and domain entities
- Implements comprehensive error handling for all data access operations
- Manages database connections and transactions
- Provides optimized query implementations for all repository operations

**Key Implementation Details:**

| Method | Implementation Highlights |
|--------|---------------------------|
| `create` | Creates a new revenue record with proper validation and error handling |
| `read` | Retrieves a revenue record by ID with NotFoundError if record doesn't exist |
| `update` | Updates an existing revenue record with optimistic concurrency control |
| `delete` | Deletes a revenue record by ID with proper error handling |
| `findByDateRange` | Uses SQL range queries to efficiently find revenues in a date range |
| `findByPeriod` | Finds a revenue record by period with proper null handling |
| `upsert` | Implements an atomic upsert operation with conflict resolution |
| `upsertByPeriod` | Specialized upsert that uses period as the unique key |

**Usage Example:**
```typescript
import { RevenueRepository } from '@/features/revenues/repository/revenue.repository';
import { getDB } from '@/db/connection';
import type { RevenueCreateEntity } from '@/features/revenues/core/revenue.entity';

// Creating a repository instance with dependency injection
const revenueRepository = new RevenueRepository(getDB());

// Using the repository for data operations
async function createNewRevenue(revenueData: RevenueCreateEntity) {
  try {
    // Create a new revenue record
    const newRevenue = await revenueRepository.create(revenueData);
    console.log(`Created revenue record with ID: ${newRevenue.id}`);
    return newRevenue;
  } catch (error) {
    console.error('Failed to create revenue record:', error);
    throw error;
  }
}

// Finding revenues in a date range
async function getRevenuesForDateRange(startPeriod: Period, endPeriod: Period) {
  const revenues = await revenueRepository.findByDateRange(startPeriod, endPeriod);
  console.log(`Found ${revenues.length} revenue records in the specified date range`);
  return revenues;
}
```

## Integration Points

The repository layer integrates with:
- Database layer (`src/db`)
- Revenue core domain models (`src/features/revenues/core`)
- Revenue services (`src/features/revenues/services`)
- Error handling system (`src/errors/errors.ts`)
- Logging utilities (`src/lib/utils/logger.ts`)

## Repository Pattern Benefits

1. **Separation of Concerns**: Isolates data access logic from business logic
2. **Testability**: Makes testing easier through dependency injection and mocking
3. **Flexibility**: Allows changing data sources without affecting domain logic
4. **Consistency**: Provides a uniform interface for data operations

## Best Practices

1. **Interface-First Design**: Always define the repository interface before implementation
2. **Error Handling**: Use domain-specific error classes from `src/errors/errors.ts`
3. **Logging**: Include proper logging for debugging and monitoring
4. **Transactions**: Manage database transactions carefully
5. **Mapping**: Keep entity mapping logic within repositories or dedicated mappers
6. **Query Optimization**: Optimize queries for performance

## Error Handling Example

```typescript
import { DatabaseError, NotFoundError } from '@/errors/errors';
import { logger } from '@/lib/utils/logger';
import type { RevenueEntity } from '@/features/revenues/core/revenue.entity';
import type { RevenueId } from '@/lib/definitions/brands';

// In the repository implementation class
class RevenueRepository implements RevenueRepositoryInterface {
  // Other methods...
  
  async read(id: RevenueId): Promise<RevenueEntity> {
    try {
      const result = await this.db.query.revenues.findFirst({
        where: eq(revenues.id, id)
      });
      
      if (!result) {
        throw new NotFoundError(`Revenue with id ${id} not found`);
      }
      
      return mapRevRowToRevEnt(result);
    } catch (error) {
      logger.error({ error, id }, 'Failed to retrieve revenue by id');
      
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      throw new DatabaseError('Database error when retrieving revenue', { cause: error });
    }
  }
}
```

## Architecture Notes

The repository layer is a key component in the application's clean architecture:

- It isolates the domain model from database implementation details
- It provides a boundary between infrastructure and domain layers
- It enables swapping data sources without changing business logic
- It centralizes data access logic for better maintainability
