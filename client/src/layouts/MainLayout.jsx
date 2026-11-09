import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import ErrorBoundary from "../components/ui/ErrorBoundary";
import PageLoader from "../components/ui/PageLoader";

export default function MainLayout() {
  const { pathname } = useLocation();
  return (
    <>
      <Navbar />
      {/* 4rem header + 2.75rem category strip */}
      <main className="w-full pt-[6.75rem] bg-background min-h-screen">
        <ErrorBoundary resetKey={pathname}>
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </>
  );
}