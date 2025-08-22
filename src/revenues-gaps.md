Overall: you’re very close to a clean, scalable split. Your revenues code now reflects good boundaries: client-safe feature utilities for display/formatting and server-only event/services code for orchestration and persistence. A few small tweaks will make it airtight.

What looks good
- Event orchestration
    - src/server/revenues/events/orchestrator.ts uses logging and policy modules. Clear separation of concerns and “server-only” directive present. Good.
    - Logging and policy extracted under revenues/events is the right move. Keep policy functions pure and side-effect free (only log via the logging module when necessary).
- Server services
    - RevenueService under src/server/revenues/services is a proper domain service layer.
    - Statistics service separated from orchestration (assuming you placed it under services as we discussed).
- Feature vs server usage
    - RevenueChart component consumes a server action and uses feature display utilities (generateYAxis). That’s an ideal flow: server action → DTO → feature display helper → UI.

Gaps and suggested refinements
- Make orchestrator’s API sharper
    - processInvoiceEvent has an unused _revenueService parameter. Either remove it or actually incorporate it (e.g., pass to processor wrappers or use for additional checks).
- Ensure policy purity and import boundaries
    - Policy functions like extractAndValidatePeriod and isInvoiceEligibleForRevenue should remain side-effect-lean. If they need to log, route logs through the dedicated logging module to keep testing easy.
- Keep template generation client-safe
    - Any month template generation used by charts or UI should live in features (no Node crypto, no server mappers). If you still have a template helper on the server that returns display entities, keep that separate and clearly named (e.g., server “template” utilities vs feature “template.client”).
- DTO/view model line
    - RevenueChart uses SimpleRevenueDto directly. That’s fine if the DTO is already UI-appropriate. If not, add a thin feature-side mapper to a view model (e.g., formatting), keeping presentation concerns out of server actions.

Naming and placement checklist
- Server
    - src/server/revenues/services/revenue.service.ts — domain service (present)
    - src/server/revenues/services/revenue-statistics.service.ts — stats service (recommended)
    - src/server/revenues/events/
        - logging.ts — centralized log helpers (present)
        - policy.ts — eligibility/period extraction (present)
        - processors.ts — update/create/delete helpers (if you split them)
        - orchestrator.ts — processInvoiceEvent (present)
    - Keep import "server-only" at the top of all server files.
- Features
    - src/features/revenues/lib/display/y-axis.ts — generateYAxis (present)
    - src/features/revenues/lib/display/money.ts — convertCentsToDollars (if not already)
    - src/features/revenues/lib/date/
        - period.ts — dateToPeriod, periodToDate, periodKey, etc.
        - range.ts — calculateDateRange, generateMonthlyPeriods, createMonthTemplateFromIndex
        - format.ts — formatDateToPeriod (present)
    - src/features/revenues/lib/data/
        - template.client.ts — generateMonthsTemplate (present)
        - merge.ts — mergeDataWithTemplate (pure, no server logger)
        - lookup.ts — createDataLookupMap, computeTemplatePeriods (pure)
        - coverage.ts — makeCoverageReport (pure)
    - src/features/revenues/core/types.ts — IntervalDuration, MonthName, MONTH_ORDER, RollingMonthData, RevenueStatistics (feature-owned, reusable by server)
- Shared
    - src/shared/brands/domain-brands.ts — Period brand and helpers (already used)
    - Shared, generic date helpers (e.g., formatYearMonth) stay here

Quality guardrails to add
- ESLint import boundaries
    - Forbid imports from src/server/** in client/feature/ui files.
    - Forbid imports from features/**/components in server code.
- Barrels
    - If you add index.ts barrels, scope them per folder to avoid accidental deep imports crossing layers (e.g., don’t re-export server code from a feature barrel).
- Tests
    - Unit-test policy functions and date utilities (pure) under features.
    - Integration-test event orchestrator and processors under server.

Actionable to-dos
- Remove or use the unused _revenueService in orchestrator.processInvoiceEvent.
- Confirm none of your feature libs import server logging or server mappers.
- Ensure all server-only files start with import "server-only".
- If any pure utilities still log via server logger, move the logging to the caller or behind an optional callback.

Net: Your revenues organization is strong. Finalize the few boundary details above, and you’ll have a maintainable, testable, and scalable setup.
