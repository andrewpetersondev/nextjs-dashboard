/**
 * Cookie recording that the banner was dismissed.
 *
 * The `_v2` suffix is a re-show switch: bumping it invalidates every dismissal
 * already stored in a browser, so a new banner reaches people who dismissed the
 * old one.
 */
export const BANNER_DISMISSED_COOKIE = "banner_dismissed_v2" as const;

/** How long a dismissal survives, in seconds (180 days). */
export const BANNER_DISMISSED_MAX_AGE_S = 15_552_000;
