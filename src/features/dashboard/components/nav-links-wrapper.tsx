import type { JSX } from "react";
import { NavLinks } from "@/features/dashboard/components/nav-links";
import { getValidUserRole } from "@/features/users/lib/get-valid-user-role";
import { verifySessionOptimistic } from "@/server/auth/actions/verify-session";
import type { AuthRole } from "@/shared/auth/domain/roles";
import type { SessionVerificationResult } from "@/shared/auth/sessions/dto/types";

export async function NavLinksWrapper(): Promise<JSX.Element> {
  const session: SessionVerificationResult = await verifySessionOptimistic();
  const role: AuthRole = getValidUserRole(session?.role);
  return <NavLinks role={role} />;
}
