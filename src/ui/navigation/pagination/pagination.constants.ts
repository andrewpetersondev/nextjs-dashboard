/** At or below this many pages, every page is listed and no ellipsis appears. */
export const PAGINATION_SMALL_THRESHOLD = 7;

/** Current page at or below this counts as "near the start". */
export const PAGINATION_START_EDGE = 3;

/** Distance from the last page that counts as "near the end". */
export const PAGINATION_END_EDGE_OFFSET = 2;

export const FIRST_PAGE = 1;
export const SECOND_PAGE = 2;
export const THIRD_PAGE = 3;

/** Gap marker in a pagination range — rendered, never clickable. */
export const ELLIPSIS = "...";

/**
 * Rows per page.
 *
 * Not purely presentational despite living under `ui/`: the invoices DAL imports
 * it for the SQL `LIMIT` and for the total-pages division, so changing it
 * changes what the database returns, not just how it is drawn.
 */
export const ITEMS_PER_PAGE = 10;
