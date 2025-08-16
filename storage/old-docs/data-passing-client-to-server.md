
  ## Data Passing: Client to Server in Next.js App Router

  - The`Search` component in `src/ui/search.tsx` is a client component.
  - When a user types in the search input, `Search` updates the URL's query string using Next.js navigation (`replace`).
  - This URL change triggers a re - render of the parent server component(`Page` in `src/app/dashboard/invoices/page.tsx`).
  - The server component receives updated `searchParams` props from Next.js, reflecting the new query string.
  - The server component uses these props to fetch and render data accordingly.
  - No direct prop or callback passing occurs from client to server; all data flows via URL changes.
