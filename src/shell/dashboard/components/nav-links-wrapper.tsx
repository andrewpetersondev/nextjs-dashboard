import type { JSX } from "react";
import type { UserRole } from "@/modules/auth/domain/auth.roles";
import type { SessionVerificationResult } from "@/modules/auth/domain/sessions/session-payload.types";
import { verifySessionOptimistic } from "@/modules/auth/server/application/actions/verify-session-optimistic.action";
import { getValidUserRole } from "@/modules/users/domain/get-valid-user-role";
import { NavLinks } from "@/shell/dashboard/components/nav-links";

export async function NavLinksWrapper(): Promise<JSX.Element> {
  const session: SessionVerificationResult = await verifySessionOptimistic();
  const role: UserRole = getValidUserRole(session?.role);
  return <NavLinks role={role} />;
}
