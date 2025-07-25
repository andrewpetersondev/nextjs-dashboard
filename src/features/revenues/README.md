
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

The revenue feature follows a clean architecture pattern with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Layer      │    │  Data Access    │    │   Database      │
│   (Dashboard)   │◄──►│     Layer       │◄──►│    Tables       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
│
┌─────────────────┐
│  Service Layer  │
│   (Business     │
│     Logic)      │
└─────────────────┘
│
┌─────────────────┐
│  Repository     │
│     Layer       │
└─────────────────┘
```

## Core Components

### 1. Data Access Layer (`revenue.dal.ts`)
**Purpose**: Primary interface for UI components to fetch revenue data
- `fetchRevenue()` - Get full revenue data with metadata
- `fetchSimpleRevenue()` - Get simplified data for charts
- `recalculateRevenue()` - Force fresh calculations

### 2. Service Layer (`revenue.service.ts`)
**Purpose**: Business logic for revenue calculations and caching
- `getRevenueForYear()` - Smart caching: check database first, calculate if needed
- `calculateMonthlyRevenue()` - Core invoice aggregation logic
- `recalculateRevenueForYear()` - Fresh calculation with cache invalidation

### 3. Repository Layer (`revenue.repository.ts`)
**Purpose**: Direct database operations for revenue table
- CRUD operations for stored revenue records
- Year-based filtering for efficient queries
- Clean separation from business logic

### 4. Mapping Layer (`revenue.mapper.ts`)
**Purpose**: Data transformation between layers
- `entityToDomain()` - Database entities to domain objects
- `domainToDto()` - Domain objects to client DTOs
- `invoiceDataToRevenue()` - Raw invoice data to revenue objects

## Data Flow

### Initial Revenue Request
1. **UI Request** → `fetchRevenue(db, year)`
2. **Cache Check** → `RevenueService.getRevenueForYear()`
3. **Database Query** → `RevenueRepository.findByYear()`
4. **If No Data** → Calculate from invoices → Store in database
5. **Return** → Sorted and mapped revenue data

### Invoice-Based Calculation
```sql
-- Core aggregation query
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

## Key Features

### Smart Caching Strategy
- **First Request**: Calculate from invoices, store in database
- **Subsequent Requests**: Retrieve from database for fast response
- **Manual Refresh**: `recalculateRevenue()` for fresh data
- **Automatic Metadata**: Track calculation source and timestamp

### Invoice Integration
- **Zero Schema Changes**: Uses existing invoice fields (`id`, `date`, `amount`, `customerId`)
- **Real-time Accuracy**: Revenue reflects current invoice data when recalculated
- **Optional Filtering**: Support for customer-specific revenue calculations

### Data Consistency
- **Branded Types**: `RevenueId` ensures type safety across layers
- **Validation**: Comprehensive error handling with context
- **Audit Trail**: Track calculation source, date, and metadata

## Performance Considerations

### Database Optimization
- **Indexed Queries**: Relies on existing invoice date indexes
- **Efficient Aggregation**: Single query for monthly calculations
- **Minimal Storage**: Only stores calculated results, not raw data

### Caching Strategy
- **Year-based Caching**: Cache full year of monthly data
- **Selective Recalculation**: Only recalculate when explicitly requested
- **Memory Efficient**: Uses database as cache storage

## Usage Examples

### Basic Revenue Fetching
```typescript
// Get current year revenue
const currentYearRevenue = await fetchRevenue(db);

// Get specific year revenue
const revenue2024 = await fetchRevenue(db, 2024);

// Get simple data for charts
const chartData = await fetchSimpleRevenue(db, 2024);
```

### Force Recalculation
```typescript
// Recalculate after invoice changes
const freshRevenue = await recalculateRevenue(db, 2024);
```

## Error Handling

The system implements comprehensive error handling:
- **Validation Errors**: Invalid year or date parameters
- **Database Errors**: Connection issues or query failures
- **Calculation Errors**: Invoice data inconsistencies
- **Context Preservation**: Detailed error messages for debugging

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
- **Branded Types** - Type safety for domain objects
- **Clean Architecture** - Separation of concerns

## Monitoring & Maintenance

### Key Metrics
- **Calculation Performance**: Time to calculate monthly revenue
- **Cache Hit Rate**: Percentage of requests served from cache
- **Data Accuracy**: Revenue totals vs. invoice sums

### Maintenance Tasks
- **Periodic Recalculation**: Refresh revenue data for accuracy
- **Index Monitoring**: Ensure invoice date indexes remain optimal
- **Storage Cleanup**: Archive old revenue calculations if needed
