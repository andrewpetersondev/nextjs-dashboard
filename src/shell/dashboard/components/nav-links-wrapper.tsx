import type { JSX } from "react";
import type { SessionVerificationDto } from "@/modules/auth/application/session/dtos/responses/session-verification.dto";
import { verifySessionOptimistic } from "@/modules/auth/presentation/session/actions/verify-session-optimistic.action";
import { normalizeUserRole } from "@/shared/validation/user/user-role.parser";
import type { UserRole } from "@/shared/validation/user/user-role.schema";
import { NavLinks } from "@/shell/dashboard/components/nav-links";

export async function NavLinksWrapper(): Promise<JSX.Element> {
  const session: SessionVerificationDto = await verifySessionOptimistic();
  const role: UserRole = normalizeUserRole(session?.role);
  return <NavLinks role={role} />;
}
