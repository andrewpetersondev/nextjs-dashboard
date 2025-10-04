# utils/array

Array utility functions for immutable operations.

## Overview

- Functions for array transformation, filtering, and searching.
- All utilities are strictly typed and documented.
- Prefer readonly arrays and avoid in-place mutations.

## Usage Example

```ts
import {uniqueArray} from './uniqueArray';

const result = uniqueArray([1, 2, 2, 3]); // [1, 2, 3]
```
