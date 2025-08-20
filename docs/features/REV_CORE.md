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

- Contains the core `RevenueEntity` interface representing revenue records in the domain
- Includes derived entity types for creating and updating revenue records
- Provides display-oriented entity extensions for UI purposes

**Key Entities:**

- `RevenueEntity` - Represents a revenue entity in the database
- `RevenueCreateEntity` - Domain model for creating a new revenue record (excludes `id`)
- `RevenueUpdatable` - Narrow domain model for updating a revenue record
- `RevenueDisplayEntity` - Display-oriented entity extending RevenueEntity with UI-specific fields

**Usage Example:**
```typescript
import { 
  RevenueEntity, 
  RevenueCreateEntity, 
  RevenueDisplayEntity 
} from '@/features/revenues/core/revenue.entity';

// Working with revenue entities in services
const revenueEntity: RevenueEntity = {
  id: 'rev_123456789',
  calculationSource: 'seed',
  createdAt: new Date('2025-08-01'),
  invoiceCount: 5,
  period: new Date('2025-08-01') as Period,
  totalAmount: 150000, // In cents
  updatedAt: new Date('2025-08-05')
};

// Creating a new revenue entity
const newRevenue: RevenueCreateEntity = {
  calculationSource: 'handler',
  createdAt: new Date(),
  invoiceCount: 3,
  period: new Date('2025-08-01') as Period,
  totalAmount: 75000, // In cents
  updatedAt: new Date()
};
```

### `revenue.dto.ts`

Contains Data Transfer Objects used for transferring revenue data between layers.

- Defines structures for incoming and outgoing API data
- Separates external API contracts from internal domain models
- Provides request/response object definitions for revenue operations

**Key DTOs:**

- `SimpleRevenueDto` - Data Transfer Object for simplified revenue display data
- `RevenueChartDto` - Complete chart data transfer object with revenue data and statistical metrics
- `RevenueStatisticsDto` - Statistical metrics data transfer object with dollar-converted values

**Usage Example:**
```typescript
import { 
  SimpleRevenueDto, 
  RevenueChartDto, 
  RevenueStatisticsDto 
} from '@/features/revenues/core/revenue.dto';

// Working with revenue chart data
const chartData: RevenueChartDto = {
  monthlyData: [
    { month: "Jan", monthNumber: 1, totalAmount: 1250.75 },
    { month: "Feb", monthNumber: 2, totalAmount: 1420.50 },
    // Additional months...
  ],
  statistics: {
    average: 1350.25,
    maximum: 1750.00,
    minimum: 950.50,
    total: 16203.00,
    monthsWithData: 12
  },
  year: 2025
};
```

### `revenue.types.ts`

Defines TypeScript types, interfaces, and type aliases specific to the revenue domain.

- Includes constants like `MONTH_ORDER` and `INTERVAL_DURATIONS`
- Defines type-safe unions like `MonthName` and `IntervalDuration`
- Contains utility types for operations on revenue data
- Provides standardized result types like `RevenueActionResult<T>`
- Defines interfaces for revenue statistics and chart data

**Key Types:**

- `MONTH_ORDER` - Ordered array of three-letter month abbreviations
- `MonthName` - Type-safe union of valid month name abbreviations
- `INTERVAL_DURATIONS` - Standardized period durations for revenue calculations
- `IntervalDuration` - Type-safe union of valid period durations
- `RevenueActionResult<T>` - Discriminated union type for revenue operation results
- `RollingMonthData` - Metadata for a single month in a 12-month rolling period
- `RevenueStatistics` - Calculated statistical metrics from revenue data
- `YAxisResult` - Chart axis data for revenue charts

**Usage Example:**
```typescript
import { 
  MonthName, 
  RevenueActionResult, 
  RevenueStatistics 
} from '@/features/revenues/core/revenue.types';

// Using the RevenueActionResult type for type-safe error handling
const result: RevenueActionResult<RevenueChartDto> = await getRevenueChartAction();

if (result.success) {
  // TypeScript knows result.data is RevenueChartDto
  console.log(result.data.statistics.total);
} else {
  // TypeScript knows result.error is string
  console.error(result.error);
}

// Using MonthName type for type-safe month references
const currentMonth: MonthName = "Jan";
```

### `revenue.mapper.ts`

Contains mapping functions to transform between different representations of revenue data.

- Provides functions to convert between database rows and domain entities
- Handles data transformation and normalization
- Ensures consistency when moving data between layers

**Key Mapping Functions:**

- `mapRevenueRowToEntity` - Maps a raw revenue row from the database to a RevenueEntity object
- `mapRevenueRowsToEntities` - Maps an array of raw revenue rows to an array of RevenueEntity objects
- `mapRevenueEntityToDisplayEntity` - Maps RevenueEntity to RevenueDisplayEntity with UI-specific fields

**Usage Example:**
```typescript
import { 
  mapRevRowToRevEnt, 
  mapRevenueRowsToEntities,
  mapRevEntToRevDisplayEnt 
} from '@/features/revenues/core/revenue.mapper';
import type { RevenueRow } from "@/db/schema";

// Convert a database row to an entity
const revenueRow: RevenueRow = {
  id: 'rev_123456789',
  calculationSource: 'seed',
  createdAt: new Date('2025-08-01'),
  invoiceCount: 5,
  period: new Date('2025-08-01') as Period, // first day of month
  totalAmount: 150000, // cents
  updatedAt: new Date('2025-08-05')
};
const entity = mapRevRowToRevEnt(revenueRow);

// Convert an entity to a display entity
const displayEntity = mapRevEntToRevDisplayEnt(entity);
console.log(displayEntity.month); // "Aug"
console.log(displayEntity.year); // 2025
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
