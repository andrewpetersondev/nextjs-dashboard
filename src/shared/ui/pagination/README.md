# ui/pagination

Pagination logic and constants for UI components. Use for generating pagination controls and managing pagination state.

## Overview

- Functions and constants for pagination calculation and state management.
- All utilities are strictly typed and documented.

## Usage Example

```ts
import {getPagination} from './getPagination';

const {pages, current} = getPagination({total: 100, perPage: 10, current: 2});
```

