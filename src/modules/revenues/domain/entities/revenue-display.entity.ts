import type { MonthName } from "@/modules/revenues/domain/constants";
import type { RevenueEntity } from "@/modules/revenues/domain/entities/revenue.entity";

/**
 * Display-oriented entity extending RevenueEntity with UI-specific fields.
 *
 * This entity adds computed display fields while maintaining all the
 * original entity data for complete context in UI components.
 *
 * @prop month - Three-letter month abbreviation (e.g., "Jan", "Feb")
 * @prop year - The year in YYYY format
 * @prop monthNumber - Calendar month number (1-12)
 */
export interface RevenueDisplayEntity extends RevenueEntity {
  readonly month: MonthName;
  readonly monthNumber: number;
  readonly year: number;
}
