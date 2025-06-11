# Font Management Guide

---

## Overview

This project uses multiple custom fonts to enhance the user interface, leveraging Next.js font optimization, Tailwind CSS, and CSS variables. This guide details the font integration strategy, usage conventions, and implementation patterns.

---

## Font Assignments

| Font         | Usage Context                | Access Method                | Example Class/Component      |
|--------------|-----------------------------|------------------------------|------------------------------|
| Noto Sans    | Body text, base UI          | Next.js font loader, class   | `notoSans.className`         |
| Tektur       | Headings (`h1`-`h6`)        | Next.js font loader, React   | `<H1>`, `<H2>`, ...          |
| Merienda     | Paragraphs, special text    | CSS variable                 | `var(--font-eyegrab)`        |
| Doto         | Utility/experimental text   | Tailwind utility class       | `font-experiment`            |

---

## Integration Details

### 1. Next.js Font Loader (Noto Sans, Tektur, Merienda, Doto)

- Fonts are imported in `src/ui/style/fonts.ts` using `next/font/google`.
- Each font is exported as a constant for use in components.

```typescript
// src/ui/style/fonts.ts
import { Noto_Sans, Tektur, Merienda, Doto } from "next/font/google";

export const notoSans = Noto_Sans({ subsets: ["latin"], display: "swap" });
export const tektur = Tektur({ subsets: ["latin"], display: "swap" });
export const merienda = Merienda({ subsets: ["latin"], display: "swap" });
export const doto = Doto({ subsets: ["latin"], display: "swap" });
```
--- 

### 2. Global Font Application (Noto Sans)

- The root layout applies `notoSans.className` to the `<body>`, ensuring consistent body font. 

```tsx
// src/app/layout.tsx
import { notoSans } from "@/src/ui/style/fonts";

export default function RootLayout({ children }: { children: React.ReactNode }) {
return (
<html lang="en">
<body className={notoSans.className}>
{children}
</body>
</html>
);
}
```

---

### 3. Headings Font (Tektur)

- All heading components (`<H1>`-`<H6>`) use the Tektur font via a reusable component pattern.

```tsx
// src/ui/headings.tsx
import { tektur } from "@/src/ui/style/fonts";
import clsx from "clsx";

const headingStyles = { /* ... */ };

function createHeading<T extends keyof typeof headingStyles>(tag: T) {
  // ...
}

export const H1 = createHeading("h1");
// ... H2-H6
```

---

### 4. Paragraphs and Special Text (Merienda)

- The Merienda font is assigned to paragraphs via a CSS variable.
- Defined in `:root` and applied in `globals.css`.

```css
/* src/app/globals.css */
:root {
  --font-eyegrab: "merienda", sans-serif;
}

p {
  font-family: var(--font-eyegrab), sans-serif;
}
```

---


### 5. Utility Font Class (Doto)

- The Doto font is exposed via a custom Tailwind utility class (`font-experiment`).
- Defined in the Tailwind theme and used for experimental or highlighted text.

```css
@theme {
  --font-experiment: "Doto", sans-serif;
}
```

```tsx
/* Usage in JSX */
<span className="font-experiment">Log in</span>
```
--- 

##. Best Practices
- Consistency: Use the designated font for each context as described above.
- Performance: Fonts are loaded with display: swap for optimal rendering.
- Maintainability: All font imports and exports are centralized in src/ui/style/fonts.ts.
- Accessibility: Ensure sufficient contrast and legibility when customizing font styles.

---

## TODO

- Learn how fonts are loaded in Next.js and Tailwind CSS.

- Evaluate and adopt improved font loading strategies as Next.js and Tailwind CSS evolve.

- Monitor for layout shifts and optimize font loading for performance.

---

## References

- [Next.js Font Optimization](https://nextjs.org/docs/app/getting-started/fonts)

- [Tailwind CSS Customization](https://tailwindcss.com/docs/font-family)
