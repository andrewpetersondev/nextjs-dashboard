
# Revenue Management Feature

## Overview

The Revenue Management feature provides dynamic revenue calculation and tracking based on invoice data, replacing hardcoded seed data with real-time calculations from the invoice system. This feature maintains performance through intelligent caching while ensuring data accuracy and consistency.

## Goals

### Primary Objectives
- **Dynamic Revenue Calculation**: Calculate monthly revenue totals directly from invoice data
- **Performance Optimization**: Cache calculated revenue to avoid repeated expensive calculations
- **Data Integrity**: Ensure revenue data accurately reflects invoice amounts and counts
- **Flexible Time Ranges**: Support revenue queries by year with monthly granularity
- **Minimal Schema Impact**: Achieve functionality without modifying existing invoice schema

### Business Value
- Real-time revenue insights without manual data entry
- Automatic synchronization between invoices and revenue reporting
- Historical revenue data preservation for analytics and reporting
- Scalable architecture that supports future revenue analysis features

## Architecture Overview

The revenue feature follows a clean architecture pattern with clear separation of concerns and proper dependency flow:

```
┌─────────────────┐
│   UI Layer      │
│ (Client/Server  │
│  Components)    │
└─────────┬───────┘
│
┌─────────▼───────┐
│  Actions Layer  │
│ (Server Actions │
│ & Validation)   │
└─────────┬───────┘
│
┌─────────▼───────┐
│  Service Layer  │
│  (Business      │
│   Logic)        │
└─────────┬───────┘
│
┌─────────▼───────┐
│  Repository     │
│     Layer       │
└─────────┬───────┘
│
┌─────────▼───────┐
│   Database      │
└─────────────────┘
```

### Layer Responsibilities

**UI Layer**: React components (client and server) that handle user interaction and display. Never directly accesses lower layers.

**Actions Layer**: Next.js Server Actions that handle input validation, error boundaries, and coordinate between UI and business logic. Provides type-safe client-server communication.

**Service Layer**: Core business logic for revenue calculations, caching strategies, and domain rules. Pure business logic with no framework dependencies.

**Repository Layer**: Data access abstraction that handles database operations. Isolated from business logic concerns.

**Database Layer**: PostgreSQL tables and queries. Only accessed through the Repository layer.

## Core Components

### 1. Actions Layer (`revenue.actions.ts`)
**Purpose**: Server Actions providing validated entry points for UI interactions

```typescript
// Key functions
- getRevenueAction() - Validated revenue fetching with error handling
- recalculateRevenueAction() - Force recalculation with cache invalidation
```

**Features**:
- Input validation using Zod schemas
- Consistent error response formatting
- Next.js cache revalidation
- Type-safe client-server communication

### 2. Service Layer (`revenue.service.ts`)
**Purpose**: Business logic for revenue calculations and caching

```typescript
// Core business methods
- getRevenueForYear() - Smart caching: check database first, calculate if needed
- calculateMonthlyRevenue() - Core invoice aggregation logic
- recalculateRevenueForYear() - Fresh calculation with cache invalidation
```

**Features**:
- Pure business logic with no framework dependencies
- Intelligent caching strategies
- Domain-specific validation and rules

### 3. Repository Layer (`revenue.repository.ts`)
**Purpose**: Direct database operations for revenue table

```typescript
// Database operations
- findByYear() - Retrieve cached revenue data
- save() - Store calculated revenue
- deleteByYear() - Clear cached data for recalculation
```

**Features**:
- CRUD operations for stored revenue records
- Year-based filtering for efficient queries
- Clean separation from business logic
- Database-specific optimizations

### 4. Mapping Layer (`revenue.mapper.ts`)
**Purpose**: Data transformation between layers

```typescript
// Transformation functions
- entityToDomain() - Database entities to domain objects
- domainToDto() - Domain objects to client DTOs
- invoiceDataToRevenue() - Raw invoice data to revenue objects
```

### 5. Data Access Layer (`revenue.dal.ts`) - **Deprecated**
**Status**: Legacy component being phased out
- Previously provided direct database access to UI
- **Migration Path**: Move functionality to Actions and Service layers
- **Current State**: Maintained for backward compatibility only

## Data Flow

### Modern Architecture Flow (Recommended)
1. **UI Request** → Server Action (`getRevenueAction`)
2. **Input Validation** → Zod schema validation
3. **Business Logic** → `RevenueService.getRevenueForYear()`
4. **Cache Check** → `RevenueRepository.findByYear()`
5. **If No Data** → Calculate from invoices → Store in database
6. **Response** → Validated DTO returned to UI
7. **Error Handling** → Structured error responses

### Invoice-Based Calculation
When cached data is unavailable, the system calculates revenue from invoices:

```sql
SELECT
  COUNT(invoices.id) as invoiceCount,
  TO_CHAR(invoices.date, 'Mon') as month,
  SUM(invoices.amount)::integer as revenue,
  EXTRACT(YEAR FROM invoices.date)::integer as year
FROM invoices
WHERE invoices.date >= ? AND invoices.date <= ?
GROUP BY EXTRACT(MONTH FROM invoices.date), TO_CHAR(invoices.date, 'Mon')
ORDER BY EXTRACT(MONTH FROM invoices.date)
```

## Usage Examples

### Server Component Usage
```typescript
// In a server component
async function RevenuePageComponent({ year }: { year?: number }) {
  const result = await getRevenueAction(db, { year });
  
  if (!result.success) {
    return <ErrorDisplay message={result.error} />;
  }
  
  return <RevenueChart data={result.data} />;
}
```

### Client Component with Form
```typescript
// In a client component with form submission
function RecalculateRevenueForm() {
  const [isPending, startTransition] = useTransition();
  
  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const year = Number(formData.get("year"));
      const result = await recalculateRevenueAction(db, { year });
      
      if (!result.success) {
        toast.error(result.error);
      } else {
        toast.success("Revenue recalculated successfully");
      }
    });
  };
  
  return (
    <form action={handleSubmit}>
      <input name="year" type="number" required />
      <button disabled={isPending}>
        {isPending ? "Recalculating..." : "Recalculate"}
      </button>
    </form>
  );
}
```

## Migration Guidelines

### From DAL to Actions Pattern

**Before (Legacy DAL Usage):**
```typescript
// In UI component - NOT RECOMMENDED
const revenue = await fetchRevenue(db, 2024);
```

**After (Actions Pattern):**
```typescript
// In Server Component
const result = await getRevenueAction(db, { year: 2024 });
if (!result.success) {
  return <ErrorDisplay message={result.error} />;
}
return <RevenueChart data={result.data} />;

// In Client Component with form
const handleRecalculate = async (formData: FormData) => {
  const year = Number(formData.get("year"));
  const result = await recalculateRevenueAction(db, { year });
  // Handle result...
};
```

## Key Features

### Smart Caching Strategy
- **First Request**: Calculate from invoices, store in database
- **Subsequent Requests**: Retrieve from database for fast response
- **Manual Refresh**: `recalculateRevenueAction()` for fresh data
- **Automatic Metadata**: Track calculation source and timestamp

### Invoice Integration
- **Zero Schema Changes**: Uses existing invoice fields (`id`, `date`, `amount`, `customerId`)
- **Real-time Accuracy**: Revenue reflects current invoice data when recalculated
- **Optional Filtering**: Support for customer-specific revenue calculations

### Data Consistency
- **Branded Types**: `RevenueId` ensures type safety across layers
- **Input Validation**: Zod schemas prevent invalid data from reaching business logic
- **Audit Trail**: Track calculation source, date, and metadata

## Benefits of Updated Architecture

**1. Input Validation**: Centralized validation prevents invalid data from reaching business logic

**2. Error Boundaries**: Consistent error handling across all revenue operations

**3. Type Safety**: Strong typing between client/server boundaries with Zod schemas

**4. Cache Management**: Automatic Next.js cache revalidation

**5. Security**: Server-side validation and sanitization

**6. Testability**: Each layer can be unit tested independently

**7. Framework Isolation**: Business logic remains pure and framework-agnostic

## Performance Considerations

### Database Optimization
- **Indexed Queries**: Relies on existing invoice date indexes
- **Efficient Aggregation**: Single query for monthly calculations
- **Minimal Storage**: Only stores calculated results, not raw data

### Caching Strategy
- **Year-based Caching**: Cache full year of monthly data
- **Selective Recalculation**: Only recalculate when explicitly requested
- **Memory Efficient**: Uses database as cache storage

## Error Handling

The system implements comprehensive error handling:

### Input Validation Errors
```typescript
// Zod schema validation
const GetRevenueSchema = z.object({
  year: z.number().int().min(2000).max(2100).optional(),
});
```

### Structured Error Responses
```typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

### Context Preservation
- Detailed error messages for debugging
- Error boundary integration with React components
- Structured logging for server errors

## Testing Strategy

### Unit Testing
- **Actions Layer**: Test input validation and error handling
- **Service Layer**: Test business logic in isolation
- **Repository Layer**: Test database operations with mocks
- **Mapper Layer**: Test data transformations

### Integration Testing
- End-to-end revenue calculation flow
- Cache invalidation behavior
- Error propagation through layers

## Future Enhancements

### Planned Features
- **Customer-specific Revenue**: Filter revenue by customer
- **Period Flexibility**: Support custom date ranges beyond yearly
- **Revenue Forecasting**: Predictive analytics based on historical data
- **Real-time Updates**: WebSocket integration for live revenue updates

### Extensibility Points
- **Custom Aggregations**: Additional revenue metrics (average, median)
- **Multi-currency Support**: Revenue calculations in different currencies
- **Revenue Categories**: Group revenue by invoice types or categories

## Dependencies

### Required Tables
- `invoices` - Source data for calculations
- `revenues` - Calculated revenue storage

### Key Libraries
- **Drizzle ORM** - Database queries and aggregations
- **Zod** - Input validation and type safety
- **Next.js App Router** - Server Actions and caching
- **TypeScript** - Type safety across all layers

## Monitoring & Maintenance

### Key Metrics
- **Calculation Performance**: Time to calculate monthly revenue
- **Cache Hit Rate**: Percentage of requests served from cache
- **Data Accuracy**: Revenue totals vs. invoice sums
- **Error Rates**: Validation and calculation failures

### Maintenance Tasks
- **Periodic Recalculation**: Refresh revenue data for accuracy
- **Index Monitoring**: Ensure invoice date indexes remain optimal
- **Storage Cleanup**: Archive old revenue calculations if needed
- **Performance Monitoring**: Track query execution times

