import { requireAdminActor } from "@/presentation/routes/guards";
import { AdminDashboard } from "@/presentation/ui/AdminDashboard";

export default async function AdminPage() {
  await requireAdminActor();
  return <AdminDashboard />;
}
