import { Fragment, useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import Logo from "../ui/Logo";
import Icon from "../ui/Icon";
import SearchBox from "./SearchBox";
import UserMenu from "./UserMenu";
import { useAuth } from "../../hooks/useAuth";
import { useCategories } from "../../hooks/useCategories";
import { conversationService } from "../../services/conversationService";

const navClass = ({ isActive }) =>
  `font-label-md text-label-md transition-colors py-1 ${
    isActive
      ? "text-primary font-bold border-b-2 border-primary"
      : "text-on-surface-variant hover:text-on-surface"
  }`;

export default function Navbar() {
  const { user } = useAuth();
  const categories = useCategories();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  // Close the mobile menu on navigation
  useEffect(() => setMobileOpen(false), [location.pathname]);

  // Real unread-message count for the bell
  useEffect(() => {
    if (!user) {
      setUnread(0);
      return;
    }
    let active = true;
    conversationService
      .unreadCount()
      .then((n) => active && setUnread(n))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [user, location.pathname]);

  const links = [
    { to: "/explore", label: "Explore Gigs", show: true },
    { to: "/orders", label: "My Orders", show: Boolean(user) },
    { to: "/messages", label: "Messages", show: Boolean(user) },
    { to: "/dashboard", label: "Switch to Selling", show: user?.role === "freelancer" },
  ].filter((l) => l.show);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest border-b border-outline-variant">
      <div className="h-16 max-w-7xl mx-auto px-margin-sm lg:px-margin flex items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md">
          <Logo />
          <SearchBox className="hidden md:flex" />
        </div>

        <nav className="hidden lg:flex items-center gap-space-lg" aria-label="Main">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={navClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-space-md">
          {user ? (
            <>
              <Link
                to="/messages"
                aria-label={unread ? `${unread} unread messages` : "Messages"}
                className="relative p-1 text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <Icon name="notifications" className="text-body-lg" />
                {unread > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />}
              </Link>
              <UserMenu />
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-space-sm">
              <Link
                to="/login"
                className="font-label-sm text-label-sm uppercase tracking-wide text-on-surface hover:text-primary px-3 py-1.5"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="bg-primary text-on-primary font-label-sm text-label-sm uppercase px-3 py-1.5 border border-primary hover:bg-primary-container transition-colors"
              >
                Join
              </Link>
            </div>
          )}
          <button
            type="button"
            className="lg:hidden p-1 text-on-surface"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
          >
            <Icon name={mobileOpen ? "close" : "menu"} />
          </button>
        </div>
      </div>

      {/* Category strip (real categories from the API) */}
      <div className="h-11 bg-surface-container-low border-t border-outline-variant">
        <div className="max-w-7xl mx-auto px-margin-sm lg:px-margin h-full flex items-center overflow-x-auto gap-space-md">
          {categories.map((c, i) => (
            <Fragment key={c._id}>
              {i > 0 && <span className="text-outline-variant text-label-sm">/</span>}
              <Link
                to={`/explore?category=${c.slug}`}
                className="font-label-sm text-label-sm uppercase tracking-wide text-on-surface-variant hover:text-primary whitespace-nowrap"
              >
                {c.name}
              </Link>
            </Fragment>
          ))}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-outline-variant bg-surface-container-lowest p-space-md space-y-space-md">
          <SearchBox className="flex md:hidden" />
          <nav className="flex flex-col gap-space-sm" aria-label="Mobile">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={navClass}>
                {l.label}
              </NavLink>
            ))}
            {!user && (
              <>
                <Link to="/login" className="font-label-md text-label-md text-on-surface py-1">Log in</Link>
                <Link to="/register" className="font-label-md text-label-md text-primary font-bold py-1">Join GigCraft</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}