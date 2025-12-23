export const APP_ERROR_LAYER = {
  API: "API",
  DB: "DB",
  DOMAIN: "DOMAIN",
  INTERNAL: "INTERNAL",
  SECURITY: "SECURITY",
  UI: "UI",
  VALIDATION: "VALIDATION",
} as const;

export type AppErrorLayer = keyof typeof APP_ERROR_LAYER;
