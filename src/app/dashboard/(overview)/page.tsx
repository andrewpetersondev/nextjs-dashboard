import { verifySessionOptimistic } from "@/lib/dal";
import AdminDashboard from "@/ui/dashboard/admin-dashboard";
import UserDashboard from "@/ui/dashboard/user-dashboard";
import MiddlewareCard from "@/ui/dashboard/middleware-card";

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
  }
  return (
    <div>
      <UserDashboard />
    </div>
  );
}
