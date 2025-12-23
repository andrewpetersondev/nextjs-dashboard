export const APP_ERROR_LAYER = {
  API: "API",
  APPLICATION: "APPLICATION",
  DOMAIN: "DOMAIN",
  INFRASTRUCTURE: "INFRASTRUCTURE",
  INTERNAL: "INTERNAL",
  UI: "UI",
} as const;

export type AppErrorLayer =
  (typeof APP_ERROR_LAYER)[keyof typeof APP_ERROR_LAYER];
