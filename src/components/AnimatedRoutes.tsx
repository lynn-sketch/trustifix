import { useEffect } from "react";
import { useNavigationType, useLocation, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { IndexPage } from "../pages/Index";
import { AuthPage } from "../pages/Auth";
import { ServicesPage } from "../pages/Services";
import { ProviderProfilePage } from "../pages/ProviderProfile";
import { DashboardPage } from "../pages/Dashboard";
import { ProviderDashboardPage } from "../pages/ProviderDashboard";
import { WalletPage } from "../pages/Wallet";
import { AdminPage } from "../pages/Admin";
import { BecomeProviderPage } from "../pages/BecomeProvider";
import { MessagesPage } from "../pages/Messages";
import { NotificationsPage } from "../pages/Notifications";
import { TrustSafetyPage } from "../pages/TrustSafety";
import { BlogPage } from "../pages/Blog";
import { BlogPostPage } from "../pages/BlogPost";
import { EventsPage } from "../pages/Events";
import { AuctionPage } from "../pages/Auction";
import { ProfilePage } from "../pages/Profile";

export function AnimatedRoutes() {
  const location = useLocation();
  const navType = useNavigationType();
  const dir = navType === "POP" ? "back" : "forward";
  useScrollReveal();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div
      key={location.pathname}
      className={`tf-route-shell tf-route-${dir}`}
      data-route={location.pathname}
    >
      <Routes location={location}>
        <Route path="/" element={<IndexPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/trust-safety" element={<TrustSafetyPage />} />
        <Route
          path="/services"
          element={
            <ProtectedRoute>
              <ServicesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider/:id"
          element={
            <ProtectedRoute>
              <ProviderProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={["customer", "admin"]}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider-dashboard"
          element={
            <ProtectedRoute roles={["provider", "admin"]} permission="provider:manage_jobs">
              <ProviderDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute permission="message:send">
              <MessagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallet"
          element={
            <ProtectedRoute permission="wallet:view">
              <WalletPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]} permission="admin:access">
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blog"
          element={
            <ProtectedRoute>
              <BlogPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blog/:slug"
          element={
            <ProtectedRoute>
              <BlogPostPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <EventsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/auction"
          element={
            <ProtectedRoute>
              <AuctionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/become-provider"
          element={
            <ProtectedRoute>
              <BecomeProviderPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
