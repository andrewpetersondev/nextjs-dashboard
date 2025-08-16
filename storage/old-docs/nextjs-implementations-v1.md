# Next.js API Implementations

This document outlines how Next.js features are implemented in this project, noting patterns, best practices, and areas for maximized feature usage.

---

## Core Next.js Features

### 1. Middleware
- `src/middleware.ts` manages authentication, user role logic, and redirects.
- Runs at the Edge for all requests matching route patterns.
- Uses Next.js `NextRequest` and `NextResponse` for advanced handling.

### 2. Search Params
- Search params are accessed in page components, especially within dynamic and filtered lists.
- For example, `/src/app/dashboard/invoices/page.tsx` utilizes `searchParams` to provide filtering.
- TypeScript interfaces used for clear typing of searchParams props.

### 3. Dynamic Routes
- Folder-based dynamic routes (e.g., `[id]`) for resources such as invoices and user profiles.
- Enables flexible RESTful URLs (e.g., `/dashboard/users/[id]`).

### 4. Server Actions
- All mutation and sensitive business logic handled server-side via server actions defined in `/src/lib/server-actions/`.
- Actions are passed as props or called via forms in components.

### 5. Server Components
- All components in `/src/app` are server components by default.
- Database access and business logic occur directly in server components (e.g., fetching customers).

### 6. Client Components
- Explicit `"use client"` directive applied in components that require interactivity, state, or hooks.
- Used for UI elements, form handling, and authentication widgets.

### 7. Static Generation (SSG)
- Pages not needing dynamic data or mutative server actions are statically generated (build-time).
- Fastest delivery, minimal runtime computation.

### 8. Server-Side Rendering (SSR)
- Pages that use server actions, fetch from the database, or perform logic at request time opt-in to SSR.
- Example: dynamic dashboard pages forced to be dynamic to prevent caching and allow up-to-date data.

### 9. Incremental Static Regeneration (ISR)
- **Currently not found.**
- Can be adopted with the `revalidate` export in page files to incrementally update static content.

### 10. Partial Pre-rendering
- Layouts such as `/src/app/dashboard/layout.tsx` ensure shared UI renders before nested content.
- Suspense boundaries in layouts and pages allow subtrees to load separately and stream.

### 11. API Routes
- No `/api` routes present.
- All business/API logic is managed via middleware, route handlers, and server actions in server components.

---

## Project Structure

### 1. App Router
- Using `/src/app` directory structure (Next.js App Router), supporting nested layouts, routing, and conventions.

### 2. `src` Directory
- Centralizes all logic: components, utils, server actions, db access, types.

### 3. `tsconfig.json`
- Typed with robust path aliases and strict settings.

### 4. `next.config.ts`
- Central place for Next.js-specific configuration, e.g., experimental settings, rewrites, images, etc.

---

## Layouts and Pages

### 1. Root Layout
- `/src/app/layout.tsx`: Top-level layout for global providers, theme, and meta.

### 2. Nested Segments
- Areas like `/dashboard/` and `/auth/` with individual layouts for contextually isolated UI.

### 3. Slugs & Dynamic Segments
- `/src/app/dashboard/invoices/[id]/page.tsx` uses `[id]` segment for invoice detail.

### 4. Search Params
- Components like `/src/app/dashboard/invoices/page.tsx` receive and apply query parameters for filtering and pagination, using either `searchParams` prop or `useSearchParams()` hook in client components.

---

## Links and Navigation

### 1. Server Rendering
- All navigation uses server-rendered pages by default.

### 2. Prefetching
- Next.js prefetches linked pages automatically for smoother user experience.

### 3. Streaming
- Suspense and streaming are implemented to progressively load expensive dashboard UI chunks.

### 4. Client-side Transitions
- `next/link` and `next/router` enable fast navigations without full reloads.

---

## Server and Client Components

- **Default to Server Components**: Data-fetching, DB access, and session logic run on the server.
- **Client Components**: Used selectively for interactivity; placed in `/src/ui/` and marked with `"use client"`.

---

## Fetching Data

- **Server Components**
   - Use the Fetch API, ORM/database clients directly in server code.
   - Example: Customer and user list fetching with direct calls to DB logic in data access layer (DAL).

- **Client Components**
   - Fetching is rare and reserved for cases with real-time needs, often handled with the `use` hook, React Query, or SWR.

- **Streaming/Suspense**
   - `loading.tsx` and `<Suspense>` are used to defer and stream loading UI, improving perceived performance.

---

## Updating Data

- **Server Functions**
   - Defined in `/src/lib/server-actions/` for mutation (e.g., create, update, delete).
   - Invoked by forms (leveraging [form actions](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration#migrating-forms-to-app-router)), or via client-side event handlers that call endpoints.

- **Passing Actions as Props**
   - Server actions can be passed to client components, used for mutation in UI forms.

---

## Caching and Revalidation

- Use of Next.js smart fetch caching by default.
- Manual override with `export const dynamic = "force-dynamic"` in pages needing real-time, uncached data.
- Option to add `revalidate`, `revalidatePath`, or unstable cache for fine-grained control (see [docs](https://nextjs.org/docs/app/building-your-application/caching)).

---

## Error Handling

- **Errors in Data Fetching or Server Actions**
   - Caught and handled gracefully, e.g., returning error UI, redirects, or logging via logger.
- **Not Found / 404**
   - Handled by throwing the `notFound()` Next.js helper for missing resources.

- **Uncaught Exception Handling**
   - Nested error boundaries in components for fine control.
   - Global error boundary (e.g., `/src/app/error.tsx`) handles root exceptions.

---

## CSS

- Uses utility-first CSS, likely with Tailwind CSS (based on packages), for rapid styling.
- Global styles defined at root layout or CSS entrypoint.

---

## Image Optimization

- Handled by `<Image />` component from Next.js, which provides automatic resizing, lazy loading, and format selection.

---

## Font Optimization

- Likely using Next.js font optimizations (`next/font`), for loading fonts efficiently.

---

## Metadata and OG Images

- Metadata for titles, descriptions, and social images declared in page-level `metadata` exports.

---

## Route Handlers and Middleware

- **Route Handlers**
   - Project does not use `/api` or custom route handlers, relying instead on server components and server actions.
   - To add route handlers, follow the [Next.js convention](https://nextjs.org/docs/app/building-your-application/routing/router-handlers).

- **Middleware**
   - Authenticates and authorizes requests for protected areas.
   - Can set headers, cookies, or perform rewrites/redirects.

---

## Deploying

- Project can be deployed to any Next.js-supported platform (Vercel, Netlify, etc.).
- SSR, middleware, and static assets are supported out-of-the-box; see hosting provider documentation for configuration.

---

## Areas for Further Feature Adoption

- **Incremental Static Regeneration (ISR)**: Add page-level `revalidate` for hybrid regeneration.
- **API Route Handlers**: Consider `/src/app/api/` for REST endpoints if external API consumers are required.
- **Edge API Routes**: For low-latency and global delivery.
- **Next.js Advanced Image, Font, and Analytics features**: For performance budgets.
- **Advanced Caching Strategies**: For more granular control over data lifecycles.

---

This documentation is meant as a living overview. Update as you evolve Next.js usage or discover additional features to adopt!
