import { verifySessionOptimistic } from "@/src/lib/dal";
import AdminDashboard from "@/src/ui/dashboard/admin-dashboard";
import UserDashboard from "@/src/ui/dashboard/user-dashboard";
import MiddlewareCard from "@/src/ui/dashboard/middleware-card";

export default async function Page() {
  const session = await verifySessionOptimistic();
  const userRole = session?.role;
  if (userRole === "admin") {
    return (
      <div>
        <MiddlewareCard />
        <AdminDashboard />
      </div>
    );
  } else {
    return (
      <div>
        <MiddlewareCard />
        <UserDashboard />
      </div>
    );
  }
}
