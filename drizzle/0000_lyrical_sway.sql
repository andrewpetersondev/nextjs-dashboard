CREATE TABLE "customers"
(
    "id"    uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name"  varchar(255)                               NOT NULL,
    "email" text                                       NOT NULL,
    "phone" text                                       NOT NULL,
    CONSTRAINT "customers_email_unique" UNIQUE ("email")
);
--> statement-breakpoint
CREATE TABLE "invoices"
(
    "id"          uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "customer_id" uuid                                       NOT NULL,
    "amount"      integer                                    NOT NULL,
    "status"      varchar(255)                               NOT NULL,
    "date"        date                                       NOT NULL
);
--> statement-breakpoint
CREATE TABLE "people"
(
    "id"    integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "people_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
    "name"  varchar(255) NOT NULL,
    "age"   integer      NOT NULL,
    "email" varchar(255) NOT NULL,
    CONSTRAINT "people_email_unique" UNIQUE ("email")
);
--> statement-breakpoint
CREATE TABLE "revenue"
(
    "month"   varchar(4) NOT NULL,
    "revenue" integer    NOT NULL,
    CONSTRAINT "revenue_month_unique" UNIQUE ("month")
);
--> statement-breakpoint
CREATE TABLE "users"
(
    "id"       uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name"     varchar(255)                               NOT NULL,
    "email"    text                                       NOT NULL,
    "password" text                                       NOT NULL,
    CONSTRAINT "users_email_unique" UNIQUE ("email")
);