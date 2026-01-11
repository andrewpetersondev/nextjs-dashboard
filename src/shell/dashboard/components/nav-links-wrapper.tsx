import type { JSX } from "react";
import type { SessionVerificationDto } from "@/modules/auth/application/dtos/session-verification.dto";
import { verifySessionOptimistic } from "@/modules/auth/infrastructure/actions/verify-session-optimistic.action";
import { normalizeUserRole } from "@/shared/domain/user/user-role.parser";
import type { UserRole } from "@/shared/domain/user/user-role.types";
import { NavLinks } from "@/shell/dashboard/components/nav-links";

export async function NavLinksWrapper(): Promise<JSX.Element> {
  const session: SessionVerificationDto = await verifySessionOptimistic();
  const role: UserRole = normalizeUserRole(session?.role);
  return <NavLinks role={role} />;
}
