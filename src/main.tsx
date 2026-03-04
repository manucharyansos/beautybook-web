// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Public pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Register from "./pages/Register";
import PublicBooking from "./pages/PublicBooking";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Pricing from "./pages/Pricing";
import Features from "./pages/Features";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";
import Support from "./pages/Support";
import Blog from "./pages/Blog";
import Press from "./pages/Press";
import Careers from "./pages/Careers";
import Faq from "./pages/Faq";

// App pages
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import { Calendar } from "./pages/Calendar";
import Services from "./pages/Services";
import Staff from "./pages/Staff";
import BusinessSettings from "./pages/BusinessSettings";
import Onboarding from "./pages/Onboarding";
import { GiftCards } from "./pages/GiftCards";
import Loyalty from "./pages/Loyalty";

import { ProtectedRoute } from "./components/ProtectedRoute";
import { OnboardingGuard } from "./components/OnboardingGuard";
import { RequireFeature } from "./components/RequireFeature";
import { AppLayout } from "./layouts/AppLayout";
import { BillingGuard } from "./components/BillingGuard";

// Admin pages
import AdminLogin from "./admin/pages/AdminLogin";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminLayout from "./admin/components/AdminLayout";
import ProtectedAdminRoute from "./admin/components/ProtectedAdminRoute";
import BusinessDetails from "./admin/pages/BusinessDetails";
import AdminBusinessesPage from "./admin/pages/AdminBusinesses";
import AdminUsers from "./admin/pages/AdminUsers";
import AdminAdmins from "./admin/pages/AdminAdmins";
import AdminLogs from "./admin/pages/AdminLogs";
import AdminPlans from "./admin/pages/AdminPlans";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* ================= PUBLIC ROUTES ================= */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/book/:slug" element={<PublicBooking />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/features" element={<Features />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/support" element={<Support />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/press" element={<Press />} />
          <Route path="/careers" element={<Careers />} />

          {/* ================= ADMIN ROUTES ================= */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<ProtectedAdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="businesses" element={<AdminBusinessesPage />} />
              <Route path="businesses/:id" element={<BusinessDetails />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="admins" element={<AdminAdmins />} />
              <Route path="logs" element={<AdminLogs />} />
              <Route path="plans" element={<AdminPlans />} />
            </Route>
          </Route>

          {/* ================= PRIVATE APP ROUTES ================= */}
          <Route element={<ProtectedRoute />}>
            <Route element={<OnboardingGuard />}>
              {/* ✅ BillingGuard պետք է լինի /app-ի վրա, onboarding-ից հետո */}
              <Route element={<BillingGuard />}>
                <Route path="/app" element={<AppLayout />}>
                  <Route index element={<Navigate to="/app/dashboard" replace />} />

                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="calendar" element={<Calendar />} />
                  <Route path="services" element={<Services />} />
                  <Route path="staff" element={<Staff />} />

                  <Route
                    path="analytics"
                    element={
                      <RequireFeature feature="analytics">
                        <Analytics />
                      </RequireFeature>
                    }
                  />

                  <Route
                    path="gift-cards"
                    element={
                      <RequireFeature feature="gift_cards">
                        <GiftCards />
                      </RequireFeature>
                    }
                  />

                  <Route
                    path="loyalty"
                    element={
                      <RequireFeature feature="loyalty">
                        <Loyalty />
                      </RequireFeature>
                    }
                  />

                  <Route path="settings" element={<BusinessSettings />} />
                </Route>
              </Route>

              {/* ✅ onboarding WITHOUT AppLayout (և առանց BillingGuard blocking) */}
              <Route path="/app/onboarding" element={<Onboarding />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<div className="p-6">404 - Page Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);