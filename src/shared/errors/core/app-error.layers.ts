export const APP_ERROR_LAYERS = [
  "API",
  "DB",
  "DOMAIN",
  "INTERNAL",
  "SECURITY",
  "UI",
  "VALIDATION",
] as const;

export type AppErrorLayer = (typeof APP_ERROR_LAYERS)[number];

export const APP_ERROR_LAYER: Readonly<{
  API: AppErrorLayer;
  DB: AppErrorLayer;
  DOMAIN: AppErrorLayer;
  INTERNAL: AppErrorLayer;
  SECURITY: AppErrorLayer;
  UI: AppErrorLayer;
  VALIDATION: AppErrorLayer;
}> = {
  API: "API",
  DB: "DB",
  DOMAIN: "DOMAIN",
  INTERNAL: "INTERNAL",
  SECURITY: "SECURITY",
  UI: "UI",
  VALIDATION: "VALIDATION",
} as const;
