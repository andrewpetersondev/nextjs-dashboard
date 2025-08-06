# Revenue Display Utilities

This directory contains utility functions for formatting and displaying revenue data. These utilities handle the presentation layer transformations necessary for consistent and user-friendly display of monetary values and chart data.

## Overview

The display utilities provide:
- Monetary value conversion from database format (cents) to display format (dollars)
- Chart axis generation and formatting for revenue visualizations
- Consistent formatting of revenue data across the application

## Files

### `revenue-display.utils.ts`

Contains utility functions for the visual presentation of revenue data:

#### Functions

##### `convertCentsToDollars(cents: number): number`

Converts monetary values stored in the database as cents to dollars for display purposes.

- **Parameters**:
    - `cents: number` - Monetary value in cents (database format)
- **Returns**:
    - `number` - Monetary value in dollars, rounded to the nearest whole dollar
- **Purpose**:
    - Performs business logic conversion from database-native cent storage to user-friendly dollar amounts
    - Eliminates fractional cents in the presentation layer

##### `generateYAxis(revenue: SimpleRevenueDto[]): YAxisResult`

Generates formatted Y-axis labels and scaling information for revenue charts.

- **Parameters**:
    - `revenue: SimpleRevenueDto[]` - Array of revenue data points
- **Returns**:
    - `YAxisResult` - Object containing formatted labels and scaling information
- **Purpose**:
    - Analyzes revenue data to determine appropriate chart scaling
    - Creates evenly-spaced, formatted axis labels with currency notation
    - Adds visual padding for better chart readability

## Usage Examples

### Converting Currency Values

```typescript
import { convertCentsToDollars } from '@/features/revenues/utils/display/revenue-display.utils';

// Convert database value to display value
const revenueInCents = 125000; // $1,250.00 in cents
const revenueInDollars = convertCentsToDollars(revenueInCents); // 1250

// Use in UI component
return (
  <div>Revenue: ${revenueInDollars}</div>
);
```

### Creating Chart Axes

```typescript
import { generateYAxis } from '@/features/revenues/utils/display/revenue-display.utils';
import { SimpleRevenueDto } from '@/features/revenues/core/revenue.dto';

// Revenue data from API or service
const revenueData: SimpleRevenueDto[] = [
  { month: 'Jan', revenue: 45000 },
  { month: 'Feb', revenue: 52000 },
  { month: 'Mar', revenue: 61000 }
];

// Generate Y-axis for chart
const { topLabel, yAxisLabels } = generateYAxis(revenueData);

// Use in chart component
return (
  <Chart 
    data={revenueData}
    yAxis={{
      max: topLabel,
      labels: yAxisLabels
    }}
  />
);
```

## Integration Points

The display utilities integrate with:
- Revenue DTOs (`src/features/revenues/core/revenue.dto.ts`)
- Revenue type definitions (`src/features/revenues/core/revenue.types.ts`)
- Chart components in the UI layer
- Server actions returning revenue data
- Statistics services providing revenue metrics

## Best Practices

1. **Consistent Formatting**: Always use these utilities for displaying revenue values to ensure consistency
2. **Type Safety**: Leverage TypeScript types to ensure correct data handling
3. **Separation of Concerns**: Keep display formatting separate from business logic
4. **Error Handling**: Validate input data before passing to formatting functions
5. **Performance**: Consider memoizing chart generation functions for large datasets

## Technical Considerations

- **Currency Precision**: The `convertCentsToDollars` function rounds to whole dollars for simplicity
- **Chart Scaling**: The Y-axis generator adds 10% padding and rounds to clean thousands
- **Internationalization**: Currently optimized for USD display format only
