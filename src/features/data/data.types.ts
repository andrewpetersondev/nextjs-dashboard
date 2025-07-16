/**
 * Dashboard card summary data.
 */
export type DashboardCardData = {
  totalPaid: string; // Formatted currency
  totalPending: string; // Formatted currency
  totalCustomers: number;
};

/**
 * Revenue data point for charting.
 */
export type RevenueData = {
  formattedRevenue: string;
  month: string; // YYYY-MM
  revenue: number;
};
