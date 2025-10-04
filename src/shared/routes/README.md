# shared/routes

Centralized route definitions and helpers for navigation and API endpoints.

## Overview

- Define and manage app routes in a single location.
- Export strictly typed route constants and helper functions.
- Avoid hardcoding route strings in components.

## Usage Example

```ts
import {DASHBOARD_ROUTE} from './dashboard';

router.push(DASHBOARD_ROUTE);
```

