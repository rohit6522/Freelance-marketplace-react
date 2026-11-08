import ClientOverview from "../../components/dashboard/ClientOverview";
import FreelancerOverview from "../../components/dashboard/FreelancerOverview";
import AdminOverview from "../../components/dashboard/AdminOverview";
import { useAuth } from "../../hooks/useAuth";

export default function DashboardHome() {
  const { user } = useAuth();
  if (user.role === "admin") return <AdminOverview />;
  return user.role === "client" ? <ClientOverview /> : <FreelancerOverview />;
}