# Revenue Feature Refactoring Strategy

## Overview

This document outlines a strategy to refactor your revenue feature from a complex CRUD-based architecture to a simplified calculation-based approach. Since revenue is **derived data** (calculated from invoices), it should be treated differently than user-managed entities.

## Current Problems

### 1. **Wrong Mental Model**
- **Current**: Revenue as a user-managed entity (like invoices)
- **Correct**: Revenue as a calculated view of invoice data

### 2. **Unnecessary Complexity**
- Full CRUD operations for data that should be read-only
- Multiple conversion layers (Entity → DTO → Entity → DTO)
- Manual database storage of calculated values
- **Redundant DAL layer** that duplicates repository functionality

### 3. **Data Consistency Issues**
- Revenue can become stale when invoices change
- Manual recalculation required to stay in sync

## Architecture Layer Clarification

### What is a DAL vs Database Access?

**DAL (Data Access Layer)** in your current code refers to separate files like `revenue.dal.ts` that create an additional abstraction layer between repositories and the database. This is **over-engineering** for your use case.

**Database Access** refers to direct queries using your ORM (Drizzle), which provides the right level of abstraction.

### Current Over-Engineered Flow

```
Actions → Service → Repository → DAL Files → Drizzle ORM → Database
```

### Recommended Simplified Flow

```
Actions → Calculator Service → Drizzle ORM → Database
```

## Key Concepts

### Event-Driven Architecture
When one feature (invoices) changes, it automatically triggers updates in dependent features (revenue). This ensures data consistency without manual intervention.

```
Invoice Created/Updated/Deleted → Revenue Recalculated → UI Updates
```

### Derived Data vs Primary Data
- **Primary Data**: User creates/manages (invoices, customers) - needs full CRUD
- **Derived Data**: System calculates (revenue, totals, statistics) - needs only read operations

### Dependency Injection Explained
A pattern where dependencies (like database connections) are "injected" into classes rather than created inside them. This makes code more testable and flexible.

```typescript
// Without DI (tightly coupled - hard to test)
class RevenueService {
  private db = getDB(); // Always uses real database
  
  async calculate() {
    return this.db.select()...;
  }
}

// With DI (loosely coupled - easy to test)
class RevenueService {
  constructor(private db: Database) {} // Dependency injected
  
  async calculate() {
    return this.db.select()...;
  }
}

// Usage
const realService = new RevenueService(getDB()); // Production
const testService = new RevenueService(mockDB); // Testing
```

## New Architecture Strategy

### Phase 1: Create Revenue Calculator Service

Replace the complex repository/service/DAL layers with a simple calculator that uses Drizzle directly:

```typescript
// src/features/revenues/revenue-calculator.service.ts
import { sql, count, between } from "drizzle-orm";
import { invoices } from "@/db/schema";
import type { Database } from "@/db/connection";
import type { RevenueEntity } from "@/db/models/revenue.entity";

export class RevenueCalculatorService {
  constructor(private db: Database) {} // Dependency injection

  /**
   * Calculate revenue by aggregating invoice data directly
   * No DAL files needed - Drizzle ORM provides sufficient abstraction
   */
  async calculateForYear(year: number): Promise<RevenueEntity[]> {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    // Direct Drizzle query - this IS the database layer
    const monthlyData = await this.db
      .select({
        month: sql<string>`TO_CHAR(${invoices.date}, 'Mon')`,
        revenue: sql<number>`COALESCE(SUM(${invoices.amount}), 0)::integer`,
        invoiceCount: count(invoices.id),
        year: sql<number>`${year}`,
      })
      .from(invoices)
      .where(between(invoices.date, startDate, endDate))
      .groupBy(sql`TO_CHAR(${invoices.date}, 'Mon')`)
      .orderBy(sql`EXTRACT(MONTH FROM ${invoices.date})`);

    // Transform to domain entities (minimal mapping)
    return monthlyData.map(data => this.transformToRevenueEntity(data));
  }

  private transformToRevenueEntity(data: any): RevenueEntity {
    const now = new Date();
    return {
      id: crypto.randomUUID() as RevenueId, // Temp ID for calculated data
      month: data.month,
      revenue: data.revenue,
      calculatedFromInvoices: data.revenue,
      invoiceCount: data.invoiceCount,
      year: data.year,
      isCalculated: true,
      calculationSource: 'invoice_aggregation',
      calculationDate: now,
      startDate: `${data.year}-01-01`,
      endDate: `${data.year}-12-31`,
      createdAt: now,
      updatedAt: now,
    };
  }
}
```

### Phase 2: Simplify Revenue Actions

Remove complex CRUD actions. Keep only read operations:

```typescript
// src/features/revenues/revenue.actions.ts
"use server";

import { RevenueCalculatorService } from "./revenue-calculator.service";
import { getDB } from "@/db/connection";
import { getCurrentYear } from "./revenue.utils";
import type { RevenueActionResult } from "./revenue.types";

/**
 * Get revenue data for a specific year
 * Much simpler than current implementation - no repository/service/DAL chain
 */
export async function getRevenueAction(
  year?: number
): Promise<RevenueActionResult<RevenueEntity[]>> {
  try {
    const targetYear = year ?? getCurrentYear();

    // Direct calculation - dependency injection for testability
    const calculator = new RevenueCalculatorService(getDB());
    const revenue = await calculator.calculateForYear(targetYear);

    return { data: revenue, success: true };
  } catch (error) {
    console.error("Revenue calculation error:", error);
    return { error: "Failed to calculate revenue", success: false };
  }
}

/**
 * Get simplified revenue data for charts
 */
export async function getRevenueChartAction(
  year?: number
): Promise<RevenueActionResult<SimpleRevenueDto[]>> {
  try {
    const targetYear = year ?? getCurrentYear();
    const calculator = new RevenueCalculatorService(getDB());
    const revenue = await calculator.calculateForYear(targetYear);

    // Simple transformation - no complex mapping needed
    const chartData = revenue.map(entity => ({
      month: entity.month,
      revenue: entity.revenue,
    }));

    return { data: chartData, success: true };
  } catch (error) {
    return { error: "Failed to fetch chart data", success: false };
  }
}
```

### Phase 3: Add Invoice Triggers

Modify invoice actions to automatically update revenue:

```typescript
// src/features/invoices/invoice.actions.ts (modifications)
import { revalidatePath } from "next/cache";

export async function createInvoiceAction(
  prevState: InvoiceActionResult,
  formData: FormData,
): Promise<InvoiceActionResult> {
  try {
    // ... existing invoice creation logic ...
    const invoice: InvoiceDto = await service.createInvoice(parsed.data);

    // Automatically trigger revenue cache invalidation
    const invoiceYear = new Date(invoice.date).getFullYear();
    await invalidateRevenueCache(invoiceYear);

    return { data: invoice, success: true, message: "Invoice created successfully" };
  } catch (error) {
    // ... error handling ...
  }
}

/**
 * Helper to invalidate revenue-related caches
 * No manual recalculation needed - revenue calculates on-demand
 */
async function invalidateRevenueCache(year: number): Promise<void> {
  revalidatePath("/dashboard");
  revalidatePath(`/revenue/${year}`);
}
```

## What Gets Removed vs What Stays

### Remove These Files (Over-Engineering)
- ❌ `src/features/revenues/revenue.dal.ts` - Redundant abstraction layer
- ❌ `src/features/revenues/revenue.repository.ts` - Not needed for calculated data
- ❌ `src/features/revenues/revenue.service.ts` - Replace with calculator
- ❌ Complex parts of `revenue.mapper.ts` - Simplify transformations

### Keep/Create These (Essential)
- ✅ `src/features/revenues/revenue-calculator.service.ts` - Core business logic
- ✅ Simplified `revenue.actions.ts` - Read-only operations
- ✅ `revenue.types.ts` - Type definitions
- ✅ `revenue.utils.ts` - Helper functions
- ✅ Direct Drizzle queries - This IS your database layer

## Architecture Comparison

### For Revenue (Derived Data) - SIMPLIFIED
```
Actions → Calculator Service → Drizzle ORM → Database
```

**Layers:**
- **Actions**: Handle user requests, validation, cache invalidation
- **Calculator Service**: Pure business logic with direct DB queries via Drizzle
- **Drizzle ORM**: Database abstraction (no separate DAL files needed)

### For Invoices (Primary Data) - FULL LAYERS
```
Actions → Service → Repository → Drizzle ORM → Database
```

**Layers:**
- **Actions**: Handle CRUD operations
- **Service**: Business rules, validation
- **Repository**: Data access abstraction
- **Drizzle ORM**: Database abstraction

## Implementation Plan

### Week 1: Foundation
1. Create `RevenueCalculatorService` with direct Drizzle queries
2. Test calculator against existing revenue data
3. Verify calculations match current stored values

### Week 2: Action Simplification
1. Replace complex revenue actions with calculator-based versions
2. Update UI components to use new simplified actions
3. Test dashboard functionality

### Week 3: Invoice Integration
1. Add revenue cache invalidation to invoice CRUD operations
2. Test automatic revenue updates when invoices change
3. Remove manual recalculation functionality

### Week 4: Cleanup
1. **Delete DAL files** - `revenue.dal.ts`
2. **Delete repository files** - `revenue.repository.ts`
3. **Simplify service** - replace with calculator
4. **Simplify mappers** - remove unnecessary conversions
5. Update documentation and add tests

## Benefits of This Approach

1. **Automatic Consistency**: Revenue always reflects current invoice state
2. **Simpler Code**: Fewer layers, direct database access via ORM
3. **Better Performance**: No unnecessary database writes for calculated data
4. **Easier Testing**: Calculator with dependency injection is easy to test
5. **Clearer Intent**: Code shows revenue is derived from invoices
6. **Proper Abstraction**: Drizzle ORM provides the right level of database abstraction

## Learning Resources

- **Event-Driven Architecture**: [Martin Fowler's Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)
- **Dependency Injection**: [Clean Architecture by Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- **Derived Data Patterns**: [Designing Data-Intensive Applications](https://dataintensive.net/)

This strategy transforms your revenue feature from a complex entity management system into a simple, reliable calculation engine that automatically stays in sync with your invoice data, while using your ORM as the appropriate database abstraction layer.
```

The key updates in this revision:

1. **Clarified DAL vs Database Access**: Explained that DAL files are unnecessary abstractions, while direct ORM queries provide the right level of database access
2. **Updated Architecture Diagrams**: Removed DAL layer from recommendations
3. **Enhanced Code Examples**: Show direct Drizzle usage instead of DAL function calls
4. **Clearer Implementation Plan**: Specifically mentions removing DAL files
5. **Better Explanation of Layers**: Distinguished between over-engineered layers (DAL files) and necessary database access (ORM)

The refactored approach eliminates the redundant DAL layer while maintaining clean database access through your Drizzle ORM.
