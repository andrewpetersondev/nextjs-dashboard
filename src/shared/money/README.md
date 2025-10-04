# shared/money

Utilities for handling monetary values, formatting, and calculations.

## Overview

- Functions for parsing, formatting, and validating currency values.
- Avoid floating-point errors; prefer integer or fixed-point math for calculations.
- All utilities are strictly typed and documented.

## Usage Example

```ts
import {formatMoney} from './formatMoney';

const result = formatMoney(12345, {currency: 'USD'}); // '$123.45'
```

