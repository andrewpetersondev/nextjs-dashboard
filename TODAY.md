# Tasks For Today

## Database

- [ ] Refactor db and testDB to use getDB connection

## Invoice Branding

### **B. ID Branding Branded types are applied only at the entity layer, but you sometimes pass around unbranded (plain string) IDs in DTOs and everywhere else.**
**Refactor:**
- **Entity:** always branded.
- **DTO:** always plain strings.

Review your to ensure it always strips the brand for API/client safety & consistency: `toInvoiceDTO`
