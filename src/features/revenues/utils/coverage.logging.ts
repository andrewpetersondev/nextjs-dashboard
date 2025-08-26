import type { Period } from "@/shared/brands/domain-brands";
import { logger } from "@/shared/logging/logger";

/**
 * Log a concise coverage report. Keep logs short and structured.
 */
export function logCoverageReport(report: {
  periods: Period[];
  templatePeriods: Period[];
  duplicates: Period[];
  invalidFormat: Period[];
  missing: Period[];
  unexpected: Period[];
  badRevenue: Period[];
}) {
  logger.error({
    context: "lookup.coverage",
    message: "Coverage validation report",
    stats: {
      badRevenue: report.badRevenue,
      displayCount: report.periods.length,
      duplicates: report.duplicates,
      invalidFormat: report.invalidFormat,
      missing: report.missing,
      templateCount: report.templatePeriods.length,
      unexpected: report.unexpected,
    },
  });
}
