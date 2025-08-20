# Revenue Event Handling

This directory contains code for handling invoice events and updating revenue records accordingly.

## Recent Simplifications

The revenue event code has been simplified to improve maintainability and reduce complexity:

### 1. Consolidated Files

- **Before**: Code was split between `revenue-event.utils.ts` and `revenue-event.helpers.ts`
- **After**: All functionality is now in a single `revenue-event.service.ts` file

### 2. Improved Organization

The new service file organizes functions into logical groups:

- **Logging Functions**: For standardized logging
- **Validation Functions**: For validating invoices and extracting data
- **Processing Functions**: For handling revenue calculations and updates

### 3. Simplified API

- Replaced `handleInvoiceEvent` with a more straightforward `processInvoiceEvent` function
- Standardized error handling patterns
- Made function signatures more consistent
- Improved function documentation

### 4. Streamlined Handler Implementation

- Simplified the complex `handleInvoiceUpdated` method
- Made the handler methods more consistent
- Reduced code duplication
- Improved error handling

## File Structure

- `revenue-event.service.ts`: Core service with all utility and helper functions
- `revenue-event.handler.ts`: Event handler that subscribes to invoice events and processes them

## Key Functions

### Validation

- `extractPeriodFromInvoice`: Extracts Period (first-of-month DATE) from invoice dates
- `isStatusEligibleForRevenue`: Checks if an invoice status is eligible for revenue
- `validateInvoiceForRevenue`: Validates invoices for revenue calculations
- `isInvoiceEligibleForRevenue`: Checks if an invoice is eligible for revenue

### Processing

- `processInvoiceEvent`: Processes an invoice event with standardized error handling
- `processInvoiceForRevenue`: Processes an invoice for revenue calculation
- `adjustRevenueForDeletedInvoice`: Adjusts revenue for deleted invoices
- `adjustRevenueForStatusChange`: Adjusts revenue based on invoice status changes

### Utilities

- `withErrorHandling`: Wraps functions with standardized error handling
- `logInfo` and `logError`: Standardized logging functions
- `handleEventError`: Error handling for event bus
- `extractAndValidatePeriod`: Extracts and validates period from invoice
- `updateRevenueRecord`: Updates revenue records

## Usage

The `RevenueEventHandler` class subscribes to invoice events and uses the service functions to process them:

```typescript
// Example: Processing an invoice created event
private async handleInvoiceCreated(event: BaseInvoiceEvent): Promise<void> {
  await processInvoiceEvent(
    event,
    this.revenueService,
    "handleInvoiceCreated",
    (invoice, period) => processInvoiceForRevenue(this.revenueService, invoice, period)
  );
}
```
