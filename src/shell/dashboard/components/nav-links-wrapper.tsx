import type { JSX } from "react";
import { verifySessionOptimistic } from "@/modules/auth/server/actions/verify-session-optimistic.action";
import type { SessionVerificationResult } from "@/modules/auth/shared/session/session.transport";
import type { UserRole } from "@/modules/auth/shared/user/auth.roles";
import { coerceUserRole } from "@/modules/users/domain/role/user.role.parser";
import { NavLinks } from "@/shell/dashboard/components/nav-links";

export async function NavLinksWrapper(): Promise<JSX.Element> {
  const session: SessionVerificationResult = await verifySessionOptimistic();
  const role: UserRole = coerceUserRole(session?.role);
  return <NavLinks role={role} />;
}
