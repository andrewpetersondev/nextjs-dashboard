// import "server-only";
//
// import {
//   createInsertSchema,
//   createSelectSchema,
//   createUpdateSchema,
// } from "drizzle-zod";
// import { customers, invoices, sessions, users } from "@/db/schema";
// import {
//   toCustomerId,
//   toInvoiceStatus,
//   toUserRole,
// } from "@/lib/definitions/brands";
//
// // Schemas generated from the database schema using drizzle-zod
//
// // USER SCHEMAS
// export const _userSelectSchema = createSelectSchema(users);
//
// export const _userInsertSchema = createInsertSchema(users, {
//   // Override role to use your existing validation logic
//   role: (schema) => schema.transform(toUserRole),
// });
//
// export const _userUpdateSchema = createUpdateSchema(users, {
//   role: (schema) =>
//     schema.optional().transform((val) => (val ? toUserRole(val) : undefined)),
// });
//
// // CUSTOMER SCHEMAS
// export const _customerSelectSchema = createSelectSchema(customers);
//
// export const _customerInsertSchema = createInsertSchema(customers);
//
// // INVOICE SCHEMAS
// export const _invoiceSelectSchema = createSelectSchema(invoices);
//
// export const _invoiceInsertSchema = createInsertSchema(invoices, {
//   customerId: (schema) => schema.transform(toCustomerId),
//   status: (schema) => schema.transform(toInvoiceStatus),
// });
//
// export const _invoiceUpdateSchema = createUpdateSchema(invoices, {
//   customerId: (schema) =>
//     schema.optional().transform((val) => (val ? toCustomerId(val) : undefined)),
//   status: (schema) =>
//     schema
//       .optional()
//       .transform((val) => (val ? toInvoiceStatus(val) : undefined)),
// });
//
// // SESSION SCHEMAS
// const _sessionSelectSchema = createSelectSchema(sessions);
