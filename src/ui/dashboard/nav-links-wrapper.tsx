import type { JSX } from "react";
import { verifySessionOptimistic } from "@/server/auth/session";
import { getValidUserRole } from "@/server/users/utils";
import type { AuthRole } from "@/shared/auth/roles";
import type { SessionVerificationResult } from "@/shared/auth/types";
import { NavLinks } from "@/ui/dashboard/nav-links";

export async function NavLinksWrapper(): Promise<JSX.Element> {
  const session: SessionVerificationResult = await verifySessionOptimistic();
  const role: AuthRole = getValidUserRole(session?.role);
  return <NavLinks role={role} />;
}
