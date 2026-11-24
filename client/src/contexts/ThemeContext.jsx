import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem("gigcraft-theme") || "system";
    } catch {
      return "system";
    }
  });

  const [resolvedTheme, setResolvedTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    try {
      const saved = localStorage.getItem("gigcraft-theme");
      if (saved === "dark") return "dark";
      if (saved === "light") return "light";
      const prefersDark =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      return prefersDark ? "dark" : "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    const hasMatchMedia = typeof window !== "undefined" && typeof window.matchMedia === "function";
    const mediaQuery = hasMatchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

    function applyTheme() {
      let active = "light";
      if (theme === "dark") {
        active = "dark";
      } else if (theme === "light") {
        active = "light";
      } else {
        active = mediaQuery?.matches ? "dark" : "light";
      }

      setResolvedTheme(active);

      if (active === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      // Update meta theme-color for mobile header
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute("content", active === "dark" ? "#0b111e" : "#005d42");
      }
    }

    applyTheme();

    if (!mediaQuery) return;

    const handler = () => {
      if (theme === "system") applyTheme();
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [theme]);

  const setTheme = (nextTheme) => {
    setThemeState(nextTheme);
    try {
      localStorage.setItem("gigcraft-theme", nextTheme);
    } catch (err) {
      console.warn("Could not save theme preference:", err);
    }
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
