// Raw column types, deliberately unbranded. The app has its own branded
// counterparts (e.g. CustomerId in src/modules/customers/domain/types/) that
// share these names but are NOT the same type — branding happens at the mapper
// boundary, so a value only becomes branded once it has crossed into the domain.
// Check the import path before assuming which one a symbol refers to.

/** Customer primary key, as stored. Not the branded domain `CustomerId`. */
export type CustomerId = string;

/** A password hash. Distinct from a plaintext password only by intent, not by type. */
export type Hash = string;

/** Invoice primary key, as stored. Not the branded domain `InvoiceId`. */
export type InvoiceId = string;

/** A revenue period, stored as the first day of its month. */
export type Period = Date;

/** User primary key, as stored. Not the branded domain `UserId`. */
export type UserId = string;
