// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Regular pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import {Calendar} from "./pages/Calendar";
import Services from "./pages/Services";
import Staff from "./pages/Staff";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./layouts/AppLayout";
import PublicBooking from "./pages/PublicBooking";
import Onboarding from "./pages/Onboarding";
import Landing from "./pages/Landing";
import { OnboardingGuard } from "./components/OnboardingGuard";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Pricing from "@/pages/Pricing.tsx";
import Features from "@/pages/Features.tsx";

// Admin pages
import AdminLogin from "./admin/pages/AdminLogin";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminLayout from "./admin/components/AdminLayout";
import ProtectedAdminRoute from "./admin/components/ProtectedAdminRoute";
import BusinessDetails from "./admin/pages/BusinessDetails";
import AdminBusinessesPage from "./admin/pages/AdminBusinesses";
import AdminUsers from "./admin/pages/AdminUsers.tsx";
import AdminAdmins from "./admin/pages/AdminAdmins.tsx";
import AdminLogs from "./admin/pages/AdminLogs.tsx";
import AdminPlans from "@/admin/pages/AdminPlans.tsx";
import BusinessSettings from "./pages/BusinessSettings.tsx";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    {/* ========== PUBLIC ROUTES ========== */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/book/:slug" element={<PublicBooking />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/features" element={<Features />} />

                    {/* ========== ADMIN ROUTES ========== */}
                    <Route path="/admin/login" element={<AdminLogin />} />

                    {/* Protected Admin Routes */}
                    <Route element={<ProtectedAdminRoute />}>
                        <Route element={<AdminLayout />}>
                            <Route path="/admin/dashboard" element={<AdminDashboard />} />
                            <Route path="/admin/businesses" element={<AdminBusinessesPage />} />
                            <Route path="/admin/businesses/:id" element={<BusinessDetails />} />
                            <Route path="/admin/users" element={<AdminUsers />} />
                            <Route path="/admin/admins" element={<AdminAdmins />} />
                            <Route path="/admin/logs" element={<AdminLogs />} />
                            <Route path="/admin/plans" element={<AdminPlans />} />
                        </Route>
                    </Route>

                    {/* ========== PRIVATE APP ROUTES ========== */}
                    <Route element={<ProtectedRoute />}>
                        <Route element={<OnboardingGuard />}>
                            {/* onboarding առանց layout */}
                            <Route path="/app/onboarding" element={<Onboarding />} />

                            {/* app pages with layout */}
                            <Route element={<AppLayout />}>
                                <Route path="/app/dashboard" element={<Dashboard />} />
                                <Route path="/app/analytics" element={<Analytics />} />
                                <Route path="/app/calendar" element={<Calendar />} />
                                <Route path="/app/services" element={<Services />} />
                                <Route path="/app/staff" element={<Staff />} />
                                <Route path="/app/settings" element={<BusinessSettings />} />
                            </Route>
                        </Route>
                    </Route>

                    {/* 404 */}
                    <Route path="*" element={<div className="p-6">404 - Page Not Found</div>} />
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    </React.StrictMode>
);