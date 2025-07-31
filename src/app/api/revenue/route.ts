import { type NextRequest, NextResponse } from "next/server";
import { getDB } from "@/db/connection";
import type { RevenueEntity } from "@/db/models/revenue.entity";
import { InvoiceRepository } from "@/features/invoices/invoice.repository";
import { DatabaseRevenueRepository } from "@/features/revenues/revenue.repository";
import { RevenueService } from "@/features/revenues/revenue.service";
import { logger } from "@/lib/utils/logger";

/**
 * Response structure for revenue API endpoints.
 * Provides consistent structure for revenue data with optional statistics.
 */
interface RevenueApiResponse {
  /** Array of revenue entities within the requested date range */
  revenue: RevenueEntity[];
  /** Optional statistical summary when includeStats=true */
  statistics?: {
    /** Total revenue amount in cents */
    total: number;
    /** Number of revenue records */
    count: number;
    /** Average revenue per record in cents */
    average: number;
  };
}

/**
 * Error response structure for consistent API error handling.
 */
interface ErrorResponse {
  /** Human-readable error message */
  error: string;
  /** Optional error code for programmatic handling */
  code?: string;
}

// Initialize service with dependency injection
const revenueService = new RevenueService(
  new DatabaseRevenueRepository(),
  new InvoiceRepository(getDB()),
);

/**
 * GET /api/revenue
 *
 * Retrieves revenue data within a specified date range with optional statistics.
 *
 * Query Parameters:
 * - startDate: ISO date string (required) - Start of date range
 * - endDate: ISO date string (required) - End of date range
 * - includeStats: boolean (optional) - Whether to include statistical summary
 *
 * @param request - Next.js request object with query parameters
 * @returns JSON response with revenue data or error message
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const includeStats = searchParams.get("includeStats") === "true";

    // Validate required parameters
    if (!startDateParam || !endDateParam) {
      const errorResponse: ErrorResponse = {
        error: "startDate and endDate parameters are required",
        code: "MISSING_REQUIRED_PARAMS",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Parse and validate dates
    const startDate = new Date(startDateParam);
    const endDate = new Date(endDateParam);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      const errorResponse: ErrorResponse = {
        error: "Invalid date format. Use ISO date strings (YYYY-MM-DD)",
        code: "INVALID_DATE_FORMAT",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    if (startDate >= endDate) {
      const errorResponse: ErrorResponse = {
        error: "startDate must be before endDate",
        code: "INVALID_DATE_RANGE",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Fetch revenue data
    const revenue = await revenueService.getRevenueByDateRange(
      startDate,
      endDate,
    );

    // Build response
    const response: RevenueApiResponse = { revenue };

    // Include statistics if requested
    if (includeStats) {
      const statistics = await revenueService.getRevenueStatistics(
        startDate,
        endDate,
      );
      response.statistics = statistics;
    }

    // Log successful request
    logger.info({
      context: {
        endpoint: "GET /api/revenue",
        dateRange: { startDate: startDateParam, endDate: endDateParam },
        includeStats,
        resultCount: revenue.length,
      },
      message: "Revenue data retrieved successfully",
    });

    return NextResponse.json(response);
  } catch (error) {
    // Log error with context
    logger.error({
      context: { endpoint: "GET /api/revenue" },
      error,
      message: "Revenue API error",
    });

    // Return generic error response
    const errorResponse: ErrorResponse = {
      error: "Failed to fetch revenue data",
      code: "INTERNAL_SERVER_ERROR",
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * POST /api/revenue/sync
 *
 * Triggers synchronization of all paid invoices with revenue recognition.
 * Useful for data migration or fixing inconsistencies.
 *
 * @param request - Next.js request object
 * @returns JSON response indicating sync completion or error
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);

    // Only allow sync endpoint
    if (!url.pathname.endsWith("/sync")) {
      const errorResponse: ErrorResponse = {
        error: "POST method only supported for /sync endpoint",
        code: "METHOD_NOT_ALLOWED",
      };
      return NextResponse.json(errorResponse, { status: 405 });
    }

    // Trigger revenue synchronization
    await revenueService.syncInvoicesWithRevenue();

    logger.info({
      context: { endpoint: "POST /api/revenue/sync" },
      message: "Revenue synchronization completed successfully",
    });

    return NextResponse.json({
      message: "Revenue synchronization completed successfully",
    });
  } catch (error) {
    logger.error({
      context: { endpoint: "POST /api/revenue/sync" },
      error,
      message: "Revenue synchronization failed",
    });

    const errorResponse: ErrorResponse = {
      error: "Failed to synchronize revenue data",
      code: "SYNC_FAILED",
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
