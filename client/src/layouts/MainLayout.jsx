import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

export default function MainLayout() {
  return (
    <>
      <Navbar />
      {/* 4rem header + 2.75rem category strip */}
      <main className="w-full pt-[6.75rem] bg-background min-h-screen">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}