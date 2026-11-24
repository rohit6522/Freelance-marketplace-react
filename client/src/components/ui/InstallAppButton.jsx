import Icon from "./Icon";
import { usePWA } from "../../hooks/usePWA";

export default function InstallAppButton({ className = "" }) {
  const { isInstallable, promptInstall } = usePWA();

  if (!isInstallable) return null;

  return (
    <button
      type="button"
      onClick={promptInstall}
      title="Install GigCraft App"
      aria-label="Install GigCraft App"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-label-sm font-label-sm uppercase font-bold text-primary border border-primary bg-primary/10 hover:bg-primary hover:text-on-primary transition-colors ${className}`}
    >
      <Icon name="install_desktop" className="text-[18px]" />
      <span className="hidden sm:inline">Install App</span>
    </button>
  );
}
