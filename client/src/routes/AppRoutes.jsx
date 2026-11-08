import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import ExplorePage from "../pages/ExplorePage";
import GigDetailPage from "../pages/GigDetailPage";
import FreelancerProfilePage from "../pages/FreelancerProfilePage";
import OrdersPage from "../pages/OrdersPage";
import MessagesPage from "../pages/MessagesPage";
import NotFoundPage from "../pages/NotFoundPage";
import DashboardHome from "../pages/dashboard/DashboardHome";
import SavedGigsPage from "../pages/dashboard/SavedGigsPage";
import ReviewsPage from "../pages/dashboard/ReviewsPage";
import SettingsPage from "../pages/dashboard/SettingsPage";
import MyGigsPage from "../pages/dashboard/MyGigsPage";
import GigFormPage from "../pages/dashboard/GigFormPage";
import EarningsPage from "../pages/dashboard/EarningsPage";
import PortfolioPage from "../pages/dashboard/PortfolioPage";
import ModerationPage from "../pages/dashboard/ModerationPage";
import AdminUsersPage from "../pages/dashboard/AdminUsersPage";
import AdminLogPage from "../pages/dashboard/AdminLogPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Navigate to="/explore" replace />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="gigs/:id" element={<GigDetailPage />} />
        <Route path="freelancers/:id" element={<FreelancerProfilePage />} />

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