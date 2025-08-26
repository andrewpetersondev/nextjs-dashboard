import { z } from "zod";

const REVENUE_MIN_YEAR = 1970;
const REVENUE_MAX_YEAR = 2100;

// Minimal, client-safe schema for revenues feature filters
export const RevenueFilterSchema = z.object({
  year: z.coerce
    .number()
    .int()
    .min(REVENUE_MIN_YEAR)
    .max(REVENUE_MAX_YEAR)
    .optional(),
});
