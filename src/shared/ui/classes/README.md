# ui/classes

CSS class utilities for UI components. Centralize reusable class logic for buttons and other UI elements.

## Overview

- Functions for composing and managing CSS class names.
- Promote consistency and reuse across UI components.
- All utilities are strictly typed and documented.

## Usage Example

```ts
import {buttonClasses} from './buttonClasses';

const className = buttonClasses({variant: 'primary', size: 'md'});
```

