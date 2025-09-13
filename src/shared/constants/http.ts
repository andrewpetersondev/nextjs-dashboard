// Common HTTP header names
export const HEADER_CACHE_CONTROL = "Cache-Control" as const;
export const HEADER_PRAGMA = "Pragma" as const;
export const HEADER_EXPIRES = "Expires" as const;
export const HEADER_VARY = "Vary" as const;
export const HEADER_CONTENT_TYPE = "content-type" as const;

// Common header values
export const CACHE_CONTROL_NO_STORE =
  "no-store, no-cache, must-revalidate" as const;
export const PRAGMA_NO_CACHE = "no-cache" as const;
export const EXPIRES_IMMEDIATELY = "0" as const;
export const VARY_COOKIE = "Cookie" as const;
export const CONTENT_TYPE_JSON = "application/json" as const;
