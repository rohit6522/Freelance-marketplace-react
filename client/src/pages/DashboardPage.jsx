import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { dashboardService } from "../services/dashboardService";

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    dashboardService
      .get(user.role)
      .then((d) => active && setData(d))
      .catch((e) => active && setError(e.message));
    return () => {
      active = false;
    };
  }, [user.role]);

  return (
    <div className="max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-xl">
      <h1 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight">
        {user.role === "client" ? "Client" : "Freelancer"} Dashboard
      </h1>
      <p className="font-body-md text-body-md text-on-surface-variant mt-space-sm">
        Welcome, {user.firstName}. Real stats from the API (the full dashboard UI is built in Step 9):
      </p>
      {error && <p role="alert" className="mt-space-md text-error">{error}</p>}
      {data && (
        <pre className="mt-space-md p-space-md bg-surface-container-low border border-outline-variant font-code-sm text-code-sm overflow-x-auto">
          {JSON.stringify(data.stats, null, 2)}
        </pre>
      )}
    </div>
  );
}