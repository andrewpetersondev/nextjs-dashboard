# utils/date

Date utility functions for formatting, guards, and normalization.

## Overview

- Functions for date formatting, parsing, and validation.
- Use ISO strings for APIs; convert at boundaries.
- All utilities are strictly typed and documented.

## Usage Example

```ts
import {formatDateISO} from './formatDateISO';

const result = formatDateISO(new Date()); // '2025-10-04T00:00:00.000Z'
```
