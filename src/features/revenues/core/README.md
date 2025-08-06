# Revenues Core Module

This directory contains the core domain models, data transfer objects (DTOs), and type definitions for the revenue feature. These files represent the domain model layer in the application's architecture, defining the fundamental data structures and types used across the revenue feature.

## Overview

The core module provides:
- Entity definitions representing the domain model
- Data Transfer Objects (DTOs) for API communication
- Type definitions for revenue-related operations
- Mapping functions between different representations of revenue data

## Files

### `revenue.entity.ts`

Defines the main revenue entity model used within the application domain.

- Contains the core `RevenueEntity` class/interface representing revenue records in the domain
- Includes entity validation rules and business constraints
- Provides type safety for revenue domain objects

**Usage Example:**
```typescript
import { RevenueEntity } from '@/features/revenues/core/revenue.entity';

// Working with revenue entities in services
const revenueEntity: RevenueEntity = {
  id: '123',
  amount: 1500.00,
  date: new Date('2023-10-15'),
  category: 'subscription',
  description: 'Monthly subscription payment'
};
```

### `revenue.dto.ts`

Contains Data Transfer Objects used for transferring revenue data between layers.

- Defines structures for incoming and outgoing API data
- Separates external API contracts from internal domain models
- Provides request/response object definitions

**Usage Example:**
```typescript
import { CreateRevenueDto, RevenueResponseDto } from '@/features/revenues/core/revenue.dto';

// Creating a DTO for API request
const createDto: CreateRevenueDto = {
  amount: 750.50,
  date: '2023-11-01',
  category: 'one-time',
  description: 'Consulting services'
};
```

### `revenue.types.ts`

Defines TypeScript types, interfaces, and type aliases specific to the revenue domain.

- Includes enums for revenue categories, statuses, etc.
- Contains utility types for operations on revenue data
- Defines shared types used across the revenue feature

**Usage Example:**
```typescript
import { RevenueCategory, RevenueStatus } from '@/features/revenues/core/revenue.types';

// Using revenue-specific types
function filterRevenuesByCategory(revenues: RevenueEntity[], category: RevenueCategory) {
  return revenues.filter(revenue => revenue.category === category);
}
```

### `revenue.mapper.ts`

Contains mapping functions to transform between different representations of revenue data.

- Provides functions to convert between entities and DTOs
- Handles data transformation and normalization
- Ensures consistency when moving data between layers

**Usage Example:**
```typescript
import { toRevenueEntity, toRevenueResponseDto } from '@/features/revenues/core/revenue.mapper';

// Convert from DTO to entity
const entity = toRevenueEntity(incomingData);

// Convert from entity to response DTO
const responseDto = toRevenueResponseDto(revenueEntity);
```

## Integration Points

The core module integrates with:
- Revenue actions (`src/features/revenues/actions/*`)
- Revenue repository (`src/features/revenues/repository/*`)
- Revenue services (`src/features/revenues/services/*`)
- Error handling system (`src/errors/errors.ts`)

## Best Practices

1. **Domain Model Integrity**: Keep entities focused on domain behavior and business rules
2. **Separation of Concerns**: Maintain clear boundaries between entities, DTOs, and other types
3. **Type Safety**: Use strict TypeScript typing for all domain objects
4. **Validation**: Implement validation logic within the appropriate domain objects
5. **Immutability**: Prefer readonly properties and immutable patterns when possible
6. **Consistency**: Follow established naming conventions and structural patterns

## Architecture Notes

This module follows clean architecture principles by:
- Keeping the domain model at the core of the application
- Separating data transfer objects from domain entities
- Providing clear mapping between different data representations
- Isolating domain types from external dependencies
