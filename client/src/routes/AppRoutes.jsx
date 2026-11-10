import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";
import ExplorePage from "../pages/ExplorePage"; // the landing page stays in the main bundle
import { lazyPage } from "../utils/lazyPage";

const LoginPage = lazyPage(() => import("../pages/LoginPage"));
const RegisterPage = lazyPage(() => import("../pages/RegisterPage"));
const ForgotPasswordPage = lazyPage(() => import("../pages/ForgotPasswordPage"));
const ResetPasswordPage = lazyPage(() => import("../pages/ResetPasswordPage"));
const GigDetailPage = lazyPage(() => import("../pages/GigDetailPage"));
const FreelancerProfilePage = lazyPage(() => import("../pages/FreelancerProfilePage"));
const OrdersPage = lazyPage(() => import("../pages/OrdersPage"));
const MessagesPage = lazyPage(() => import("../pages/MessagesPage"));
const NotFoundPage = lazyPage(() => import("../pages/NotFoundPage"));
const DashboardHome = lazyPage(() => import("../pages/dashboard/DashboardHome"));
const SavedGigsPage = lazyPage(() => import("../pages/dashboard/SavedGigsPage"));
const ReviewsPage = lazyPage(() => import("../pages/dashboard/ReviewsPage"));
const SettingsPage = lazyPage(() => import("../pages/dashboard/SettingsPage"));
const MyGigsPage = lazyPage(() => import("../pages/dashboard/MyGigsPage"));
const GigFormPage = lazyPage(() => import("../pages/dashboard/GigFormPage"));
const EarningsPage = lazyPage(() => import("../pages/dashboard/EarningsPage"));
const PortfolioPage = lazyPage(() => import("../pages/dashboard/PortfolioPage"));
const ModerationPage = lazyPage(() => import("../pages/dashboard/ModerationPage"));
const AdminUsersPage = lazyPage(() => import("../pages/dashboard/AdminUsersPage"));
const AdminLogPage = lazyPage(() => import("../pages/dashboard/AdminLogPage"));
const InfoPage = lazyPage(() => import("../pages/InfoPage"));

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Navigate to="/explore" replace />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="gigs/:id" element={<GigDetailPage />} />
        <Route path="freelancers/:id" element={<FreelancerProfilePage />} />
        <Route path="about" element={<InfoPage pageKey="about" />} />
        <Route path="help" element={<InfoPage pageKey="help" />} />
        <Route path="escrow" element={<InfoPage pageKey="escrow" />} />
        <Route path="guidelines" element={<InfoPage pageKey="guidelines" />} />
        <Route path="terms" element={<InfoPage pageKey="terms" />} />
        <Route path="privacy" element={<InfoPage pageKey="privacy" />} />

        {/* Clients and freelancers only */}
        <Route element={<ProtectedRoute roles={["client", "freelancer"]} />}>
          <Route path="orders" element={<OrdersPage />} />
          <Route path="messages" element={<MessagesPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="settings" element={<SettingsPage />} />

            <Route element={<ProtectedRoute roles={["client", "freelancer"]} />}>
              <Route path="reviews" element={<ReviewsPage />} />
            </Route>

            <Route element={<ProtectedRoute roles={["client"]} />}>
              <Route path="saved" element={<SavedGigsPage />} />
            </Route>

            <Route element={<ProtectedRoute roles={["freelancer"]} />}>
              <Route path="gigs" element={<MyGigsPage />} />
              <Route path="gigs/new" element={<GigFormPage />} />
              <Route path="gigs/:id/edit" element={<GigFormPage />} />
              <Route path="earnings" element={<EarningsPage />} />
              <Route path="portfolio" element={<PortfolioPage />} />
            </Route>

            <Route element={<ProtectedRoute roles={["admin"]} />}>
              <Route path="moderation" element={<ModerationPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="activity" element={<AdminLogPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route element={<GuestRoute />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password/:token" element={<ResetPasswordPage />} />
        </Route>
      </Route>
    </Routes>
  );
}