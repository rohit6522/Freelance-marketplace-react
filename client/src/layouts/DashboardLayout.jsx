import { Link, Outlet, useLocation } from "react-router-dom";
import Avatar from "../components/ui/Avatar";
import Icon from "../components/ui/Icon";
import { useAuth } from "../hooks/useAuth";
import { fullName } from "../utils/format";

const CLIENT_NAV = [
  ["/dashboard", "Overview", "dashboard"],
  ["/orders", "My Orders", "receipt_long"],
  ["/dashboard/saved", "Saved Gigs", "favorite"],
  ["/messages", "Messages", "forum"],
  ["/dashboard/reviews", "Reviews", "reviews"],
  ["/dashboard/settings", "Account Settings", "settings"],
];

const SELLER_NAV = [
  ["/dashboard", "Overview", "dashboard"],
  ["/dashboard/gigs", "My Gigs", "work"],
  ["/dashboard/gigs/new", "Create Gig", "add_circle"],
  ["/orders", "Manage Orders", "receipt_long"],
  ["/dashboard/earnings", "Earnings & Payouts", "payments"],
  ["/dashboard/reviews", "Reviews", "reviews"],
  ["/messages", "Messages", "forum"],
  ["/dashboard/portfolio", "Portfolio", "collections"],
  ["/dashboard/settings", "Account Settings", "settings"],
];

function isActive(to, path) {
  if (to === "/dashboard") return path === "/dashboard";
  if (to === "/dashboard/gigs") return path === to || (path.startsWith("/dashboard/gigs/") && path !== "/dashboard/gigs/new");
  return path === to || path.startsWith(`${to}/`);
}

export default function DashboardLayout() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const nav = user.role === "client" ? CLIENT_NAV : SELLER_NAV;

  return (
    <div className="max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-lg">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        <aside className="lg:col-span-3 lg:sticky lg:top-[7.5rem]">
          <div className="bg-surface-container-lowest p-space-md shadow-sm mb-space-sm flex items-center gap-space-sm">
            <Avatar user={user} square className="w-12 h-12" />
            <div className="min-w-0">
              <div className="font-headline-sm text-headline-sm text-on-surface font-bold truncate">{fullName(user)}</div>
              <span className="font-label-sm text-label-sm uppercase bg-surface-container px-space-xs text-primary font-bold">
                {user.role === "client" ? "Client" : "Freelancer"}
              </span>
            </div>
          </div>
          <nav aria-label="Dashboard" className="bg-surface-container-lowest shadow-sm flex lg:flex-col overflow-x-auto">
            {nav.map(([to, label, icon]) => {
              const active = isActive(to, pathname);
              return (
                <Link
                  key={to} to={to} aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-space-sm px-space-md py-space-sm font-label-md text-label-md whitespace-nowrap border-b-2 lg:border-b-0 lg:border-l-4 transition-colors ${
                    active
                      ? "bg-surface-container-low text-primary font-bold border-primary"
                      : "text-on-surface-variant border-transparent hover:bg-surface-container-low hover:text-on-surface"
                  }`}
                >
                  <Icon name={icon} className="text-body-md" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="lg:col-span-9 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}