import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { favoriteService } from "../services/favoriteService";

export const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [ids, setIds] = useState(() => new Set());

  // Load saved ids when the user logs in, clear on logout
  useEffect(() => {
    if (!user) {
      setIds(new Set());
      return;
    }
    let active = true;
    favoriteService
      .ids()
      .then((list) => active && setIds(new Set(list)))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [user]);

  const isSaved = useCallback((gigId) => ids.has(String(gigId)), [ids]);

  // Optimistic toggle with rollback; sends guests to login
  const toggle = useCallback(
    async (gigId) => {
      if (!user) {
        toast("Log in to save gigs");
        navigate("/login", { state: { from: location } });
        return;
      }
      const id = String(gigId);
      const wasSaved = ids.has(id);
      const apply = (add) =>
        setIds((prev) => {
          const next = new Set(prev);
          if (add) next.add(id);
          else next.delete(id);
          return next;
        });

      apply(!wasSaved);
      try {
        if (wasSaved) await favoriteService.remove(id);
        else await favoriteService.add(id);
        toast.success(wasSaved ? "Removed from saved gigs" : "Saved to your gigs");
      } catch (err) {
        apply(wasSaved); // rollback
        toast.error(err.message);
      }
    },
    [user, ids, navigate, location]
  );

  const value = useMemo(() => ({ isSaved, toggle }), [isSaved, toggle]);
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}