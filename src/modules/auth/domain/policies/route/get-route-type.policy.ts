import {
  AUTH_ROUTE_TYPES,
  type AuthRouteType,
} from "@/modules/auth/domain/constants/auth-route.constants";

/**
 * Route classification flags used to determine an `AuthRouteType`.
 *
 * @remarks
 * This policy is intentionally strict: exactly one flag must be `true`.
 * Silent fallbacks would mask upstream routing bugs and cause authorization drift.
 */
export type AuthRouteTypeFlags = Readonly<{
  isAdminRoute: boolean;
  isProtectedRoute: boolean;
  isPublicRoute: boolean;
}>;

export type AuthRouteTypeResolution =
  | Readonly<{ ok: true; value: AuthRouteType }>
  | Readonly<{
      ok: false;
      error: Readonly<{
        kind: "invalid_route_type_flags";
        trueCount: number;
      }>;
    }>;

/**
 * Determines the route type based on boolean flags.
 *
 * @remarks
 * This is the non-throwing variant used by request flows.
 * It preserves strictness while avoiding unexpected 500s.
 */
export function tryGetRouteTypePolicy(
  flags: AuthRouteTypeFlags,
): AuthRouteTypeResolution {
  const trueCount: number = [
    flags.isAdminRoute,
    flags.isProtectedRoute,
    flags.isPublicRoute,
  ].filter((v: boolean) => v).length;

  if (trueCount !== 1) {
    return {
      error: { kind: "invalid_route_type_flags", trueCount },
      ok: false,
    };
  }

  if (flags.isAdminRoute) {
    return { ok: true, value: AUTH_ROUTE_TYPES.ADMIN };
  }
  if (flags.isProtectedRoute) {
    return { ok: true, value: AUTH_ROUTE_TYPES.PROTECTED };
  }
  return { ok: true, value: AUTH_ROUTE_TYPES.PUBLIC };
}

/**
 * @deprecated Prefer {@link tryGetRouteTypePolicy} in request/edge/server flows.
 * Kept for compatibility with existing call sites that expect an exception.
 */
export function getRouteTypePolicy(flags: AuthRouteTypeFlags): AuthRouteType {
  const res = tryGetRouteTypePolicy(flags);
  if (!res.ok) {
    throw new Error(
      "Invalid route type flags: exactly one of isAdminRoute/isProtectedRoute/isPublicRoute must be true.",
    );
  }
  return res.value;
}
