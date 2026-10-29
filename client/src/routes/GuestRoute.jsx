import { Navigate, Outlet, useLocation } from "react-router-dom";
import FullPageLoader from "../components/ui/FullPageLoader";
import { useAuth } from "../hooks/useAuth";

// Login/Register are for logged-out users. Once logged in, send them back to where
// they came from (or the dashboard). Pages never need to navigate manually after login.
export default function GuestRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageLoader />;
  if (user) {
    const from = location.state?.from;
    return <Navigate to={from ? `${from.pathname}${from.search || ""}` : "/dashboard"} replace />;
  }
  return <Outlet />;
}