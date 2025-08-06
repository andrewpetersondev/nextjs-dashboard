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

Defines the contract for the revenue repository through an interface:

- Specifies all available revenue data operations
- Ensures consistent implementation across different repository implementations
- Enables dependency injection and testability through abstraction

**Usage Example:**
```typescript
import { IRevenueRepository } from '@/features/revenues/repository/revenue.repository.interface';

// In a service constructor (dependency injection)
constructor(private revenueRepository: IRevenueRepository) {}

// Using the repository through its interface
async function getRevenueById(id: string) {
  return this.revenueRepository.findById(id);
}
```

### `revenue.repository.ts`

Implements the revenue repository interface with concrete data access logic:

- Contains actual database queries and operations
- Handles data mapping between database and domain entities
- Implements error handling for data access operations
- Manages database connections and transactions

**Usage Example:**
```typescript
import { RevenueRepository } from '@/features/revenues/repository/revenue.repository';
import { db } from '@/db';

// Creating a repository instance
const revenueRepository = new RevenueRepository(db);

// Using the repository for data operations
async function createNewRevenue(revenueData: CreateRevenueDto) {
  try {
    return await revenueRepository.create(revenueData);
  } catch (error) {
    // Error handling
  }
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

// In the repository implementation
async findById(id: string): Promise<RevenueEntity> {
  try {
    const result = await this.db.revenue.findUnique({ where: { id } });
    
    if (!result) {
      throw new NotFoundError(`Revenue with id ${id} not found`);
    }
    
    return this.mapToEntity(result);
  } catch (error) {
    logger.error({ error, id }, 'Failed to retrieve revenue by id');
    
    if (error instanceof NotFoundError) {
      throw error;
    }
    
    throw new DatabaseError('Database error when retrieving revenue', { cause: error });
  }
}
```

## Architecture Notes

The repository layer is a key component in the application's clean architecture:

- It isolates the domain model from database implementation details
- It provides a boundary between infrastructure and domain layers
- It enables swapping data sources without changing business logic
- It centralizes data access logic for better maintainability
