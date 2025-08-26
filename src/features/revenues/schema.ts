import { z } from "zod";

// Minimal, client-safe schema for revenues feature filters
export const RevenueFilterSchema = z.object({
  year: z.coerce.number().int().min(1970).max(2100).optional(),
});
