//type SchemaBrand<TValue, TName extends symbol> = TValue & {
//	readonly __brand: TName;
//};
//
//const USER_ID_BRAND: unique symbol = Symbol("UserId");
//const CUSTOMER_ID_BRAND: unique symbol = Symbol("CustomerId");
//const HASH_BRAND: unique symbol = Symbol("Hash");
//const INVOICE_ID_BRAND: unique symbol = Symbol("InvoiceId");
//const PERIOD_BRAND: unique symbol = Symbol("Period");
//const REVENUE_ID_BRAND: unique symbol = Symbol("RevenueId");
//
//export type UserId = SchemaBrand<string, typeof USER_ID_BRAND>;
//export type CustomerId = SchemaBrand<string, typeof CUSTOMER_ID_BRAND>;
//export type Hash = SchemaBrand<string, typeof HASH_BRAND>;
//export type InvoiceId = SchemaBrand<string, typeof INVOICE_ID_BRAND>;
//export type Period = SchemaBrand<Date, typeof PERIOD_BRAND>;
//export type RevenueId = SchemaBrand<string, typeof REVENUE_ID_BRAND>;

export type CustomerId = string;
export type Hash = string;
export type InvoiceId = string;
export type Period = Date;
export type RevenueId = string;
export type UserId = string;
