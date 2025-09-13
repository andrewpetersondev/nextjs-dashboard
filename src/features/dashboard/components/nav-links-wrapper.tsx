import type { JSX } from "react";
import { NavLinks } from "@/features/dashboard/components/nav-links";
import { verifySessionOptimistic } from "@/server/auth/session";
import { getValidUserRole } from "@/server/users/utils";
import type { AuthRole } from "@/shared/auth/domain/roles";
import type { SessionVerificationResult } from "@/shared/auth/sessions/dto/types";

export async function NavLinksWrapper(): Promise<JSX.Element> {
  const session: SessionVerificationResult = await verifySessionOptimistic();
  const role: AuthRole = getValidUserRole(session?.role);
  return <NavLinks role={role} />;
}
