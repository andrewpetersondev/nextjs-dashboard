import type { JSX } from "react";
// biome-ignore lint/style/noRestrictedImports: <fix later>
import { verifySessionOptimistic } from "@/server/auth/session";
// biome-ignore lint/style/noRestrictedImports: <fix later>
import { getValidUserRole } from "@/server/users/utils";
import type { AuthRole } from "@/shared/auth/domain/roles";
import type { SessionVerificationResult } from "@/shared/auth/sessions/dto/types";
import { NavLinks } from "@/ui/dashboard/nav-links";

export async function NavLinksWrapper(): Promise<JSX.Element> {
  const session: SessionVerificationResult = await verifySessionOptimistic();
  const role: AuthRole = getValidUserRole(session?.role);
  return <NavLinks role={role} />;
}
