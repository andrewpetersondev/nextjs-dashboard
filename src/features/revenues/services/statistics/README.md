# Revenue Statistics Module

This directory contains the revenue statistics service responsible for analyzing and processing revenue data to generate statistical insights and reporting metrics.

## Overview

The revenue statistics module provides:
- Calculation of revenue metrics and KPIs
- Time-based revenue analysis (daily, weekly, monthly, quarterly, yearly)
- Trend identification and forecasting
- Revenue aggregations by various dimensions
- Performance comparisons across time periods

## Files

### `revenue-statistics.service.ts`

The primary service implementation for revenue statistics processing:

- Contains methods for calculating revenue metrics
- Implements statistical analysis algorithms
- Processes raw revenue data into meaningful business insights
- Provides caching mechanisms for performance optimization

**Usage Example:**
```typescript
import { RevenueStatisticsService } from '@/features/revenues/services/statistics/revenue-statistics.service';
import { RevenueRepository } from '@/features/revenues/repository/revenue.repository';

// Create statistics service
const repository = new RevenueRepository(db);
const statisticsService = new RevenueStatisticsService(repository);

// Generate monthly revenue report
async function generateMonthlyReport(year: number, month: number) {
  const statistics = await statisticsService.calculateMonthlyStatistics(year, month);
  return statistics;
}
```

## Key Capabilities

- **Revenue Aggregation**: Calculate total, average, and median revenue across time periods
- **Trend Analysis**: Identify growth patterns and revenue trends
- **Comparative Analysis**: Compare revenue across different time periods
- **Forecasting**: Project future revenue based on historical data
- **Category Analysis**: Break down revenue by categories, products, or customer segments

## Integration Points

The statistics service integrates with:
- Revenue repository (`src/features/revenues/repository`) for data access
- Revenue core types (`src/features/revenues/core`) for domain models
- Revenue utilities (`src/features/revenues/utils`) for data transformation
- Error handling system (`src/errors/errors.ts`) for error management
- Logging utilities (`src/lib/utils/logger.ts`) for operational monitoring

## Best Practices

1. **Performance Optimization**: Use caching for expensive calculations
2. **Error Handling**: Properly handle edge cases and data inconsistencies
3. **Type Safety**: Ensure strong typing for all statistical operations
4. **Testability**: Design for unit testing of statistical algorithms
5. **Separation of Concerns**:
    - Keep calculation logic separate from data fetching
    - Use pure functions for statistical operations where possible

## Example Workflow

```typescript
// In a server action or API route
import { RevenueStatisticsService } from '@/features/revenues/services/statistics/revenue-statistics.service';
import { logger } from '@/lib/utils/logger';

export async function getDashboardStatistics() {
  try {
    const stats = await statisticsService.getDashboardMetrics();
    return {
      totalRevenue: stats.total,
      monthlyGrowth: stats.growthRate,
      topCategories: stats.topPerformingCategories,
      revenueByPeriod: stats.timeSeriesData
    };
  } catch (error) {
    logger.error({ error }, 'Failed to generate dashboard statistics');
    throw error;
  }
}
```

## Architecture Notes

This module follows functional service principles:
- Pure calculation functions where possible
- Clear separation between data retrieval and processing
- Stateless service design for better testing and predictability
- Domain-driven design with strong typing
