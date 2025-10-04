# utils/string

String utility functions for normalization and transformation.

## Overview

- Single-purpose functions for string manipulation (e.g., normalization, casing, trimming).
- All functions are strictly typed and documented.
- Immutability: functions do not mutate inputs.

## Usage Example

```ts
import {normalizeString} from './normalizeString';

const result = normalizeString('  Example  '); // 'example'
```
