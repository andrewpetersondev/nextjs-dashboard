/**
 * Utility functions for revenue statistics calculations.
 *
 * This file contains utility functions specifically for revenue statistics
 * calculations, centralizing the statistics-related functionality.
 */

import "server-only";

import {
  createDefaultRevenueData,
  transformToRevenueEntity,
} from "./entity.utils";
import {
  createEmptyStatistics,
  mergeDataWithTemplate,
} from "./revenue-data.utils";
import { createMonthTemplateData } from "./template.utils";

// Re-export the functions needed by the statistics service
export {
  createEmptyStatistics,
  mergeDataWithTemplate,
  createDefaultRevenueData,
  createMonthTemplateData,
  transformToRevenueEntity,
};
