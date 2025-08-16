# Branded Types

**Branded types** (like `CustomerId`, `InvoiceId`) are used to add type safety and prevent mixing up similar primitive values (e.g., two different string IDs). Here’s when and why to use them in your stack:

---

### Where to Use Branded Types

**1. Entity Layer (Domain/Database Entities)**

- **Use branded types here.**
- Example: `InvoiceEntity` uses `InvoiceId`, `CustomerId`.
- **Why:** Prevents accidental assignment of wrong IDs and enforces domain correctness.

**2. DAL (Data Access Layer)**

- **Use branded types in function signatures and when constructing entities.**
- **Why:** Ensures only valid, correctly-typed data is passed to and from the database.

**3. Mapper Layer**

- **Brand raw data here.**
- When mapping from Database rows (plain strings) to entities, cast to branded types.
- **Why:** Database returns plain strings, but your entities require branded types.

**4. DTO Layer (API/Frontend)**

- **Do NOT use branded types here.**
- DTOs should use plain types (e.g., `string`), as they are for transport and serialization.
- **Why:** Branded types are for internal safety, not for API contracts.

**5. Validation/Input Layer**

- **Brand after validation.**
- When parsing/validating user input, cast to branded types before passing to DAL/entities.
- **Why:** Ensures only validated, branded data flows into your core logic.

---

### Summary Table

| Layer      | Use Branded Types? | Why?                                |
| ---------- | ------------------ | ----------------------------------- |
| Entity     | Yes                | Domain safety, prevent mix-ups      |
| DAL        | Yes                | Type safety for Database operations |
| Mapper     | Yes (when mapping) | Convert raw to branded for entities |
| DTO        | No                 | Simpler, serializable for API       |
| Validation | Yes (after)        | Brand after validation for safety   |

---

### Example

```typescript
// Mapper: Database row (plain string) -> Entity (branded)
const toCustomerId = (id: string): CustomerId => id as CustomerId;

export function rawDbToInvoiceEntity(row: InvoiceByIdDbRow): InvoiceEntity {
  return {
    id: toInvoiceId(row.id),
    customerId: toCustomerId(row.customerId),
    // ...
  };
}
```

---

**In summary:**

- Brand at the entity and DAL layers for safety.
- Brand when mapping from raw data.
- Use plain types in DTOs and API responses.
- Brand after validation of user input.

This approach maximizes type safety without leaking implementation details to the API or frontend.
