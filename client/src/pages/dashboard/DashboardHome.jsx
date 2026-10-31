import ClientOverview from "../../components/dashboard/ClientOverview";
import FreelancerOverview from "../../components/dashboard/FreelancerOverview";
import { useAuth } from "../../hooks/useAuth";

export default function DashboardHome() {
  const { user } = useAuth();
  return user.role === "client" ? <ClientOverview /> : <FreelancerOverview />;
}