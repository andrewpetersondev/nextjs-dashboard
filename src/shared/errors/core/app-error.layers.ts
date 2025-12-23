/** biome-ignore-all lint/style/useNamingConvention: Domain constants use ALL_CAPS and PascalCase for clarity, auto-complete, and to match business terminology. */

/**
 * Represents the distinct layers in an application where an error can occur.
 *
 * @remarks
 * This type is useful for categorizing errors based on the layer of the application architecture
 * they originate from, helping to organize error handling and debugging processes.
 */
export const APP_ERROR_LAYERS = [
  "API",
  "DB",
  "DOMAIN",
  "INTERNAL",
  "SECURITY",
  "UI",
  "VALIDATION",
] as const;

/**
 * Literal union of all supported application layers.
 */
export type AppErrorLayer = (typeof APP_ERROR_LAYERS)[number];

/**
 * Object map of application layers for stable, property-based access.
 *
 * @remarks
 * Prefer using this object to reference layers (e.g., `APP_ERROR_LAYER.API`)
 * to avoid stringly-typed values and enable auto-complete.
 */
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
