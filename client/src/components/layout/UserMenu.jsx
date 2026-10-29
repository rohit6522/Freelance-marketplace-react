import { useCallback, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Avatar from "../ui/Avatar";
import Icon from "../ui/Icon";
import { useAuth } from "../../hooks/useAuth";
import { useClickOutside } from "../../hooks/useClickOutside";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, close);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    toast.success("You have been logged out");
    navigate("/login", { replace: true });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-space-xs"
      >
        <Avatar user={user} />
        <Icon name="expand_more" className="text-outline text-body-sm hidden sm:inline-block" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-60 bg-surface-container-lowest border border-on-surface shadow-[3px_3px_0px_#0b1c30] z-50"
        >
          <div className="p-space-md border-b border-outline-variant">
            <div className="font-label-md text-label-md text-on-surface truncate">
              {user.firstName} {user.lastName}
            </div>
            <div className="font-code-sm text-code-sm text-on-surface-variant truncate">{user.email}</div>
            <span className="inline-block mt-space-xs px-2 py-0.5 bg-surface-container text-primary font-label-sm text-label-sm uppercase border border-outline-variant">
              {user.role}
            </span>
          </div>
          <Link
            to="/dashboard"
            role="menuitem"
            onClick={close}
            className="flex items-center gap-2 px-space-md py-space-sm font-label-md text-label-md text-on-surface hover:bg-surface-container-low"
          >
            <Icon name="dashboard" className="text-lg" /> Dashboard
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-space-md py-space-sm font-label-md text-label-md text-error hover:bg-surface-container-low border-t border-outline-variant"
          >
            <Icon name="logout" className="text-lg" /> Log out
          </button>
        </div>
      )}
    </div>
  );
}