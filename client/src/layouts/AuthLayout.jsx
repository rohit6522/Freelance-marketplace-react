import { Link, Outlet } from "react-router-dom";
import Logo from "../components/ui/Logo";

export default function AuthLayout() {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest border-b border-outline-variant">
        <div className="h-16 max-w-7xl mx-auto px-margin-sm lg:px-margin flex items-center justify-between gap-space-md">
          <Logo />
          <Link
            to="/explore"
            className="font-label-sm text-label-sm uppercase tracking-wide text-on-surface-variant hover:text-primary transition-colors"
          >
            Back to Marketplace
          </Link>
        </div>
      </header>

      <main className="w-full pt-16 bg-background min-h-screen">
        <div className="w-full max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-xl">
          <Outlet />
        </div>
      </main>

      <footer className="w-full bg-surface-container-lowest border-t border-outline-variant">
        <div className="max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-xs">
            <span className="font-headline-sm text-headline-sm text-primary font-bold uppercase">GigCraft</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              © {new Date().getFullYear()} GigCraft Marketplace Inc.
            </span>
          </div>
          <div className="font-code-sm text-code-sm text-on-surface-variant">SECURE ACCESS PORTAL</div>
        </div>
      </footer>
    </>
  );
}