import type { JSX } from "react";
import type { UserRole } from "@/features/auth/domain/auth.roles";
import type { SessionVerificationResult } from "@/features/auth/domain/sessions/session-payload.types";
import { getValidUserRole } from "@/features/users/lib/get-valid-user-role";
import { verifySessionOptimistic } from "@/server/auth/application/actions/verify-session-optimistic.action";
import { NavLinks } from "@/shell/dashboard/components/nav-links";

export async function NavLinksWrapper(): Promise<JSX.Element> {
  const session: SessionVerificationResult = await verifySessionOptimistic();
  const role: UserRole = getValidUserRole(session?.role);
  return <NavLinks role={role} />;
}
