# Revenue Feature Reorganization Plan

## Current Issues
- Several files are excessively long (over 200 lines)
- Related functionality is spread across multiple files
- Lack of clear organization by domain concept

## Proposed Directory Structure

```
src/features/revenues/
├── core/                       # Core domain models and interfaces
│   ├── revenue.types.ts        # Core type definitions
│   ├── revenue.entity.ts       # Entity interfaces (moved from db/models)
│   └── revenue.dto.ts          # Data transfer objects
│
├── repository/                 # Data access layer
│   ├── revenue.repository.interface.ts  # Repository interface
│   ├── revenue.repository.ts   # Repository implementation
│   └── revenue.mapper.ts       # Entity mapping functions
│
├── services/                   # Business logic services
│   ├── revenue.service.ts      # Main revenue service
│   ├── statistics/             # Statistics calculation
│   │   ├── revenue-statistics.service.ts
│   │   └── revenue-statistics.utils.ts
│   └── events/                 # Event handling
│       ├── revenue-event.handler.ts
│       └── revenue-event.utils.ts
│
├── utils/                      # Utility functions
│   ├── date/                   # Date-related utilities
│   │   ├── revenue-date.utils.ts
│   │   └── period.utils.ts     # Period-specific utilities
│   ├── data/                   # Data transformation utilities
│   │   ├── revenue-data.utils.ts
│   │   ├── template.utils.ts   # Template-related utilities
│   │   └── entity.utils.ts     # Entity creation/transformation
│   └── display/                # Display-related utilities
│       └── revenue-display.utils.ts
│
├── actions/                    # Server actions
│   └── revenue.actions.ts      # Server actions for revenue
│
└── docs/                       # Documentation
    ├── MONTHLYREVENUEQUERYRESULT_ANALYSIS.md
    └── ROLLINGMONTHDATA_USAGE.md
```

## File Splitting Strategy

### 1. revenue-event-handler.ts (498 lines)
Split into:
- `services/events/revenue-event.handler.ts` - Main handler class
- `services/events/revenue-event.utils.ts` - Event utility functions

### 2. revenue-statistics.service.ts (375 lines)
Split into:
- `services/statistics/revenue-statistics.service.ts` - Main service class
- `services/statistics/revenue-statistics.utils.ts` - Statistics utility functions

### 3. revenue.repository.ts (352 lines)
Split into:
- `repository/revenue.repository.interface.ts` - Interface definition
- `repository/revenue.repository.ts` - Implementation

### 4. revenue-data.utils.ts (286 lines)
Split into:
- `utils/data/revenue-data.utils.ts` - Core data utilities
- `utils/data/template.utils.ts` - Template-related functions
- `utils/data/entity.utils.ts` - Entity creation/transformation

### 5. revenue.types.ts (248 lines)
Split into:
- `core/revenue.types.ts` - Core type definitions
- `core/revenue.entity.ts` - Entity interfaces

## Implementation Approach
1. Create the directory structure
2. Move files with minimal changes first
3. Split larger files incrementally
4. Update imports across the codebase
5. Test after each significant change
