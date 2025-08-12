import type { JSX } from "react";
import { verifySessionOptimistic } from "@/features/sessions/session.service";
import type { SessionVerificationResult } from "@/features/sessions/session.types";
import type { UserRole } from "@/features/users/user.types";
import { getValidUserRole } from "@/features/users/user.utils";
import { NavLinks } from "@/ui/dashboard/nav-links";

export async function NavLinksWrapper(): Promise<JSX.Element> {
  const session: SessionVerificationResult = await verifySessionOptimistic();
  const role: UserRole = getValidUserRole(session?.role);
  return <NavLinks role={role} />;
}
