# utils/object

Object utility functions for diffing and sanitization.

## Overview

- Functions for object comparison, cloning, and cleaning.
- Prefer spreads and structuredClone for immutability.
- All utilities are strictly typed and documented.

## Usage Example

```ts
import {diffObjects} from './diffObjects';

const result = diffObjects({a: 1}, {a: 2}); // { a: [1, 2] }
```
