import type { JSX } from "react";
import { verifySessionOptimistic } from "@/modules/auth/server/actions/verify-session-optimistic.action";
import type { SessionTransport } from "@/modules/auth/shared/contracts/session.transport";
import type { UserRole } from "@/modules/auth/shared/domain/user/auth.roles";
import { normalizeUserRole } from "@/modules/users/domain/role/user.role.parser";
import { NavLinks } from "@/shell/dashboard/components/nav-links";

export async function NavLinksWrapper(): Promise<JSX.Element> {
  const session: SessionTransport = await verifySessionOptimistic();
  const role: UserRole = normalizeUserRole(session?.role);
  return <NavLinks role={role} />;
}
