import type { CustomerId } from "@/lib/definitions/brands";

export interface CustomerEntity {
  readonly id: CustomerId;
  readonly name: string;
  readonly email: string;
  readonly imageUrl: string;
}
