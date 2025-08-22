import "server-only";

import type {
  CustomerAggregatesServerDto,
  CustomerSelectServerDto,
} from "@/server/customers/types";

/**
 * Re-export server DTOs from a dedicated module to keep a stable import path.
 * This allows swapping or extending shapes without changing repo call sites.
 */
export type { CustomerSelectServerDto, CustomerAggregatesServerDto };
