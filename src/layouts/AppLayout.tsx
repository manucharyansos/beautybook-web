// src/layouts/AppLayout.tsx
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  CalendarDays,
  LogOut,
  Menu,
  Scissors,
  Users,
  LayoutDashboard,
  Settings,
  ChevronRight,
  Sparkles,
  X,
  Award,
  Gift,
  Star,
} from "lucide-react";

import { cn } from "../lib/cn";
import { useAuth } from "../store/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchFeatures, hasFeature } from "../lib/featuresApi";

/**
 * ✅ Nav item type with feature gating
 * If feature is defined => show only if hasFeature(features, feature)
 */
type NavItem = {
  to: string;
  label: string;
  icon: any;
  color: string;
  feature?: string;
};

/**
 * ✅ Feature Guard component for routes
 * - If feature missing => redirect to /app/dashboard
 * You can replace redirect with an "Upgrade page" later.
 */
function FeatureGuard({ feature, children }: { feature: string; children: React.ReactNode }) {
  const loc = useLocation();

  const { data: features, isLoading } = useQuery({
    queryKey: ["features"],
    queryFn: fetchFeatures,
    staleTime: 60_000,
    retry: 1,
  });

  // While loading features: allow rendering or show minimal loader
  // (Avoid flicker / wrong redirect)
  if (isLoading) {
    return (
      <div className="min-h-[40vh] grid place-items-center text-sm text-[#8F6B58] font-light">
        Բեռնում է...
      </div>
    );
  }

  const allowed = hasFeature(features, feature);

  if (!allowed) {
    // ✅ Hard redirect-ish navigation (safer for protected pages)
    // You can also return <Navigate to="/app/dashboard" replace state={{ from: loc.pathname }} />
    window.history.replaceState(null, "", "/app/dashboard");
    window.location.reload();
    return null;
  }

  return <>{children}</>;
}

/**
 * ✅ Base nav items
 * Put "feature" on items that must be hidden if not included in plan
 */
const baseNavItems: NavItem[] = [
  { to: "/app/dashboard", label: "Վահանակ", icon: LayoutDashboard, color: "from-blue-500/20 to-cyan-500/20" },
  { to: "/app/calendar", label: "Օրացույց", icon: CalendarDays, color: "from-purple-500/20 to-pink-500/20" },
  { to: "/app/services", label: "Ծառայություններ", icon: Scissors, color: "from-green-500/20 to-emerald-500/20" },
  { to: "/app/staff", label: "Աշխատակիցներ", icon: Users, color: "from-amber-500/20 to-orange-500/20" },

  // ✅ show only if analytics feature enabled
  { to: "/app/analytics", label: "Վերլուծություն", icon: BarChart3, color: "from-red-500/20 to-rose-500/20", feature: "analytics" },

  { to: "/app/settings", label: "Կարգավորումներ", icon: Settings, color: "from-gray-500/20 to-slate-500/20" },
];

// Premium animations
const sidebarVariants = {
  hidden: { x: -320, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", damping: 25, stiffness: 200 },
  },
  exit: {
    x: -320,
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

const contentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
};

export function AppLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, clear } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const featuresQ = useQuery({
    queryKey: ["features"],
    queryFn: fetchFeatures,
    staleTime: 60_000,
    retry: 1,
  });

  const features = featuresQ.data;

  const navItems = useMemo(() => {
    // 1) base items
    let items = [...baseNavItems];

    // 2) filter by feature if defined
    items = items.filter((i) => {
      if (!i.feature) return true;
      return hasFeature(features, i.feature);
    });

    // 2.5) ✅ role-based visibility
    if (user?.role === "staff") {
      // Staff should not see owner/manager admin screens
      const allowed = new Set(["/app/dashboard", "/app/calendar"]);
      items = items.filter((i) => allowed.has(i.to));
    }

    // 3) insert optional feature-controlled items (Gift Cards, Loyalty, etc.)
    const insertBeforeSettings = (item: NavItem) => {
      const idx = items.findIndex((x) => x.to === "/app/settings");
      if (idx >= 0) items.splice(idx, 0, item);
      else items.push(item);
    };

    if (hasFeature(features, "gift_cards")) {
      insertBeforeSettings({
        to: "/app/gift-cards",
        label: "Նվերի քարտեր",
        icon: Gift,
        color: "from-violet-500/20 to-fuchsia-500/20",
        feature: "gift_cards",
      });
    }

    if (hasFeature(features, "loyalty")) {
      insertBeforeSettings({
        to: "/app/loyalty",
        label: "Loyalty",
        icon: Star,
        color: "from-amber-500/20 to-yellow-500/20",
        feature: "loyalty",
      });
    }

    // If later you add "rooms" feature:
    // if (hasFeature(features, "rooms")) {
    //   insertBeforeSettings({
    //     to: "/app/rooms",
    //     label: "Սենյակներ",
    //     icon: Award,
    //     color: "from-indigo-500/20 to-violet-500/20",
    //     feature: "rooms",
    //   });
    // }

    return items;
  }, [features]);

  // Track scroll for header effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleLogout() {
    // 1) clear in-memory auth state
    clear();

    // 2) clear persisted zustand storage
    try {
      localStorage.removeItem("bb_auth");
    } catch {}

    // 3) clear cached server data
    queryClient.clear();

    // 4) hard redirect
    window.location.replace("/login");
  }

  // Role label
  const getRoleDisplay = () => {
    switch (user?.role) {
      case "owner":
        return "Սրահի սեփականատեր";
      case "manager":
        return "Կառավարիչ";
      case "staff":
        return "Աշխատակից";
      case "super_admin":
        return "Սուպեր ադմին";
      default:
        return user?.role ?? "";
    }
  };

  // ✅ business type label/icon coming from logged-in user (backend)
  const businessTypeUi = useMemo(() => {
    // In your DB: Business.business_type = "salon" | "clinic"
    // Make sure your /auth/me returns user.business_type accordingly.
    const t = String(user?.business_type ?? "");
    if (t === "clinic") {
      return { label: "Dental Clinic", icon: Award };
    }
    if (t === "salon") {
      return { label: "Beauty Salon", icon: Sparkles };
    }

    // fallback (if backend sends something else)
    // e.g. "beauty" -> treat as salon
    if (t === "beauty") {
      return { label: "Beauty Salon", icon: Sparkles };
    }
    if (t === "dental") {
      return { label: "Dental Clinic", icon: Award };
    }

    return null;
  }, [user?.business_type]);

  const BusinessTypeIcon = businessTypeUi?.icon ?? Sparkles;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#FDFAF7] to-[#FAF4ED]">
      {/* Topbar */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          "sticky top-0 z-30 transition-all duration-300",
          isScrolled
            ? "bg-white/90 backdrop-blur-xl border-b border-[#E8D5C4]/30 shadow-sm"
            : "bg-white/70 backdrop-blur-md border-b border-[#E8D5C4]/20"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between h-20">
            {/* Left */}
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="md:hidden inline-flex items-center justify-center rounded-xl
                           border border-[#E8D5C4]/30 bg-white/80 px-3 py-2.5
                           hover:border-[#C5A28A]/50 hover:bg-white
                           transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Բացել մենյուն"
              >
                <Menu size={20} className="text-[#8F6B58]" />
              </motion.button>

              {/* Logo */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => navigate("/app/dashboard")}
              >
                <div
                  className="h-10 w-10 rounded-2xl bg-gradient-to-r from-[#C5A28A] to-[#B88E72]
                              text-white grid place-items-center font-light text-xl
                              shadow-lg shadow-[#C5A28A]/20"
                >
                  B
                </div>
                <div className="hidden sm:block">
                  <div className="font-light text-lg tracking-tight text-[#2C2C2C]">
                    Beauty<span className="text-[#C5A28A]">Book</span>
                  </div>
                  <div className="text-xs text-[#8F6B58] font-light">
                    {user?.business_name || "Բիզնեսի կառավարում"}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-4">
              {/* Business type badge (from backend user) */}
              {businessTypeUi && (
                <div className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#C5A28A]/10 border border-[#C5A28A]/20">
                  <BusinessTypeIcon size={14} className="text-[#C5A28A]" />
                  <span className="text-xs text-[#8F6B58]">{businessTypeUi.label}</span>
                </div>
              )}

              {/* User */}
              <motion.div whileHover={{ scale: 1.02 }} className="hidden sm:block text-right">
                <div className="text-sm font-light text-[#2C2C2C]">{user?.name || "—"}</div>
                <div className="text-xs text-[#8F6B58] font-light flex items-center gap-1 justify-end">
                  <Sparkles size={12} className="text-[#C5A28A]" />
                  {getRoleDisplay()}
                </div>

                {/* ✅ Subscription badge (trial/active/etc.) */}
                {features?.subscription?.status && (
                  <div className="mt-1 flex justify-end">
                    <div className="text-[11px] px-2 py-0.5 rounded-full border border-[#E8D5C4]/40 bg-white/70 text-[#8F6B58] font-light">
                      {features.subscription.status === "trialing" && typeof features.subscription.days_left === "number"
                        ? `Փորձնական · ${features.subscription.days_left} օր մնաց`
                        : features.plan_code
                        ? `${features.plan_code} · ${features.subscription.status}`
                        : features.subscription.status}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Logout */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 rounded-xl border border-[#E8D5C4]/30
                           bg-white/80 px-4 py-2.5 text-sm font-light text-[#8F6B58]
                           hover:border-[#C5A28A]/50 hover:bg-white hover:text-[#C5A28A]
                           transition-all duration-300"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Ելք</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="grid md:grid-cols-[280px_1fr] gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden md:block">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="sticky top-28 space-y-4">
              <div
                className="rounded-2xl border border-[#E8D5C4]/30 bg-white/80 backdrop-blur-sm
                           p-4 shadow-lg shadow-black/5"
              >
                <div className="text-xs text-[#8F6B58] font-light tracking-wide mb-3 px-2">ՆԱՎԻԳԱՑԻԱ</div>

                <nav className="space-y-1">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5",
                          "text-sm font-light transition-all duration-300 overflow-hidden",
                          isActive ? "text-white" : "text-[#2C2C2C] hover:text-[#8F6B58]"
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <motion.div
                              layoutId="activeNav"
                              className={cn("absolute inset-0 bg-gradient-to-r", item.color, "rounded-xl")}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            />
                          )}

                          <span className="relative z-10">
                            <item.icon
                              size={18}
                              className={cn(
                                "transition-colors duration-300",
                                isActive ? "text-white" : "text-[#8F6B58] group-hover:text-[#C5A28A]"
                              )}
                            />
                          </span>

                          <span className="relative z-10 flex-1">{item.label}</span>

                          {isActive && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="relative z-10">
                              <ChevronRight size={16} className="text-white" />
                            </motion.div>
                          )}
                        </>
                      )}
                    </NavLink>
                  ))}
                </nav>
              </div>

              {/* Tip */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border border-[#E8D5C4]/30 bg-gradient-to-br
                           from-[#F9F5F0] to-[#F0E7DD] p-4 shadow-lg"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#C5A28A]/20 to-[#B88E72]/20
                               flex items-center justify-center"
                  >
                    <Sparkles size={16} className="text-[#C5A28A]" />
                  </div>
                  <div>
                    <div className="text-xs font-light text-[#2C2C2C] mb-1">Հուշում</div>
                    <div className="text-xs text-[#8F6B58] font-light leading-relaxed">
                      Սկսեք ծառայություններից, հետո ավելացրեք աշխատակիցներ, ապա ամրագրումներ։
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </aside>

          {/* Mobile drawer */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                />

                <motion.div
                  variants={sidebarVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="md:hidden fixed left-0 top-0 z-50 h-full w-[300px]
                             bg-white border-r border-[#E8D5C4]/30 shadow-2xl"
                >
                  <div className="flex items-center justify-between p-4 border-b border-[#E8D5C4]/20">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-8 w-8 rounded-xl bg-gradient-to-r from-[#C5A28A] to-[#B88E72]
                                   text-white grid place-items-center text-sm"
                      >
                        B
                      </div>
                      <span className="font-light text-[#2C2C2C]">Մենյու</span>
                    </div>

                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-8 h-8 rounded-lg border border-[#E8D5C4]/30
                                 flex items-center justify-center hover:bg-[#F9F5F0]
                                 transition-colors"
                    >
                      <X size={16} className="text-[#8F6B58]" />
                    </button>
                  </div>

                  {businessTypeUi && (
                    <div className="px-4 py-3 border-b border-[#E8D5C4]/20">
                      <div className="flex items-center gap-2">
                        <BusinessTypeIcon size={16} className="text-[#C5A28A]" />
                        <span className="text-sm font-light text-[#2C2C2C]">{businessTypeUi.label}</span>
                      </div>
                    </div>
                  )}

                  <nav className="p-4 space-y-1">
                    {navItems.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-3 rounded-xl px-3 py-3",
                            "text-sm font-light transition-all duration-300",
                            isActive ? "bg-gradient-to-r from-[#C5A28A] to-[#B88E72] text-white" : "text-[#2C2C2C] hover:bg-[#F9F5F0]"
                          )
                        }
                      >
                        <item.icon size={18} />
                        {item.label}
                      </NavLink>
                    ))}
                  </nav>

                  <div className="absolute bottom-4 left-4 right-4">
                    <button
                      onClick={handleLogout}
                      className="w-full inline-flex items-center justify-center gap-2
                                 rounded-xl border border-[#E8D5C4]/30 bg-white/80
                                 px-4 py-3 text-sm font-light text-[#8F6B58]
                                 hover:border-[#C5A28A]/50 hover:bg-white hover:text-[#C5A28A]
                                 transition-all duration-300"
                    >
                      <LogOut size={16} />
                      Ելք
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Content */}
          <motion.main variants={contentVariants} initial="hidden" animate="visible" className="min-w-0">
            {/* ✅ Optional: block rendering while features load to avoid flicker */}
            {/* If you prefer, remove this guard */}
            {featuresQ.isLoading ? (
              <div className="min-h-[50vh] grid place-items-center text-sm text-[#8F6B58] font-light">Բեռնում է...</div>
            ) : (
              <Outlet />
            )}
          </motion.main>
        </div>
      </div>
    </div>
  );
}
