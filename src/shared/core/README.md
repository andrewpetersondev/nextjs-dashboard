When to place code in core vs domain

Put in core if:

- It has no knowledge of your business entities, only shapes/types (UUID, Date-first-of-month, HTTP-ish errors, Result).

Put in domain if:

- It brands or validates business identifiers (CustomerId, InvoiceId), or codifies domain terms.

Practices

- Keep core modules tree-shakable and side-effect free.
- All public functions/types should be documented with brief TSDoc.
- Avoid default exports; keep names explicit.
- Ensure isomorphic usage: no server-only imports in core.

Your current tree already aligns well with this split: shared/core holds branding, errors, result, validation;
shared/domain holds branded IDs and converters. Continue this boundary: grow domain-specific validators in
shared/domain; keep shared/core strictly generic.
