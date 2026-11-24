import Icon from "./Icon";
import { useTheme } from "../../hooks/useTheme";

export default function ThemeToggle({ className = "" }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`w-8 h-8 inline-flex items-center justify-center border border-outline-variant hover:border-primary text-on-surface-variant hover:text-primary bg-surface-container-low hover:bg-surface-container transition-colors shrink-0 ${className}`}
    >
      <Icon
        name={isDark ? "light_mode" : "dark_mode"}
        className="text-[20px] transition-transform duration-200"
      />
    </button>
  );
}
