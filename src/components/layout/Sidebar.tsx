import React, { useState, useEffect, useMemo } from "react";
import logoImg from "../../assets/logo.jpg";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Layers,
  Award,
  WarehouseIcon,
  Receipt,
  Users,
  Ticket,
  Star,
  MessageCircle,
  Settings,
  ChevronDown,
  X,
  Boxes,
  ShoppingCart,
  Sparkles,
} from "../../utils/icons";
import { useTranslation } from "../../lib/i18n";
import { LanguageSwitcher } from "../common/LanguageSwitcher";
import { ThemeToggle } from "../common/ThemeToggle";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = React.memo(({
  isOpen = false,
  onClose,
}) => {
  const location = useLocation();
  const { t } = useTranslation();

  // Accordion routes check
  const isCatalogRoute = [
    "/products",
    "/categories",
    "/brands",
    "/warehouses",
  ].includes(location.pathname);
  const isSalesRoute = ["/orders", "/users", "/chat"].includes(
    location.pathname,
  );
  const isPromoRoute = ["/coupons", "/reviews", "/settings"].includes(
    location.pathname,
  );

  // Consolidated accordion state
  const [openAccordions, setOpenAccordions] = useState({
    catalog: isCatalogRoute,
    sales: isSalesRoute,
    promo: isPromoRoute,
  });

  useEffect(() => {
    setOpenAccordions((prev) => ({
      catalog: isCatalogRoute || prev.catalog,
      sales: isSalesRoute || prev.sales,
      promo: isPromoRoute || prev.promo,
    }));
  }, [isCatalogRoute, isSalesRoute, isPromoRoute]);

  const toggleAccordion = (key: "catalog" | "sales" | "promo") => {
    setOpenAccordions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const catalogItems = useMemo(
    () => [
      { path: "/products", label: t("products"), icon: Package },
      { path: "/categories", label: t("categories"), icon: Layers },
      { path: "/brands", label: t("brands"), icon: Award },
      { path: "/warehouses", label: t("warehouses"), icon: WarehouseIcon },
    ],
    [t],
  );

  const salesItems = useMemo(
    () => [
      { path: "/orders", label: t("orders"), icon: Receipt },
      { path: "/users", label: t("users"), icon: Users },
      { path: "/chat", label: t("chat"), icon: MessageCircle },
    ],
    [t],
  );

  const promoItems = useMemo(
    () => [
      { path: "/coupons", label: t("coupons"), icon: Ticket },
      { path: "/reviews", label: t("reviews"), icon: Star },
      { path: "/settings", label: t("feesRates"), icon: Settings },
    ],
    [t],
  );

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-4 w-full overflow-y-auto overflow-x-hidden no-scrollbar">
      <div>
        {/* Prominent Logo Header */}
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="flex items-center gap-3">
            <img
              src={logoImg}
              alt="Logo"
              width={44}
              height={44}
              className="h-11 w-11 rounded-2xl object-cover shadow-lg shadow-indigo-500/15 border border-slate-200 dark:border-white/10 shrink-0"
            />
            <div className="min-w-0 pt-2 pb-1">
              <h1 className="font-wedding text-slate-900 dark:text-white text-3xl sm:text-4xl leading-normal overflow-visible whitespace-nowrap">
                Góc Nhà Linh
              </h1>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation Accordions */}
        <nav className="space-y-1.5">
          {/* Overview Item */}
          <Link
            to="/"
            onClick={onClose}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 ${
              location.pathname === "/"
                ? "bg-indigo-50 dark:bg-gradient-to-r dark:from-indigo-500/20 dark:to-purple-500/20 border-l-4 border-indigo-600 text-indigo-600 dark:text-white shadow-sm font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
          >
            <LayoutDashboard
              className={`h-4.5 w-4.5 shrink-0 ${location.pathname === "/" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`}
            />
            <span className="truncate">{t("overview")}</span>
          </Link>

          {/* Group 1: Hàng hóa & Kho */}
          <div className="space-y-1">
            <button
              onClick={() => toggleAccordion("catalog")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                isCatalogRoute
                  ? "bg-indigo-50/70 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Boxes
                  className={`h-4.5 w-4.5 shrink-0 ${isCatalogRoute ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`}
                />
                <span className="truncate">Hàng hóa & Kho</span>
              </div>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 shrink-0 ${
                  openAccordions.catalog
                    ? "rotate-180 text-indigo-600 dark:text-indigo-400"
                    : "text-slate-400"
                }`}
              />
            </button>

            {openAccordions.catalog && (
              <div className="pl-6 space-y-1 py-1 animate-in slide-in-from-top-2 duration-150 border-l-2 border-slate-200 dark:border-white/10 ml-5">
                {catalogItems.map((sub) => {
                  const SubIcon = sub.icon;
                  const isSubActive = location.pathname === sub.path;
                  return (
                    <Link
                      key={sub.path}
                      to={sub.path}
                      onClick={onClose}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-xs transition-all duration-200 ${
                        isSubActive
                          ? "bg-indigo-600 text-white shadow-sm font-semibold"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                      }`}
                    >
                      <SubIcon
                        className={`h-3.5 w-3.5 shrink-0 ${isSubActive ? "text-white" : "text-slate-400"}`}
                      />
                      <span className="truncate">{sub.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Group 2: Đơn hàng & Khách hàng */}
          <div className="space-y-1">
            <button
              onClick={() => toggleAccordion("sales")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                isSalesRoute
                  ? "bg-indigo-50/70 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <ShoppingCart
                  className={`h-4.5 w-4.5 shrink-0 ${isSalesRoute ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`}
                />
                <span className="truncate">Đơn hàng & CSKH</span>
              </div>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 shrink-0 ${
                  openAccordions.sales
                    ? "rotate-180 text-indigo-600 dark:text-indigo-400"
                    : "text-slate-400"
                }`}
              />
            </button>

            {openAccordions.sales && (
              <div className="pl-6 space-y-1 py-1 animate-in slide-in-from-top-2 duration-150 border-l-2 border-slate-200 dark:border-white/10 ml-5">
                {salesItems.map((sub) => {
                  const SubIcon = sub.icon;
                  const isSubActive = location.pathname === sub.path;
                  return (
                    <Link
                      key={sub.path}
                      to={sub.path}
                      onClick={onClose}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-xs transition-all duration-200 ${
                        isSubActive
                          ? "bg-indigo-600 text-white shadow-sm font-semibold"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                      }`}
                    >
                      <SubIcon
                        className={`h-3.5 w-3.5 shrink-0 ${isSubActive ? "text-white" : "text-slate-400"}`}
                      />
                      <span className="truncate">{sub.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Group 3: Khuyến mãi & Cấu hình */}
          <div className="space-y-1">
            <button
              onClick={() => toggleAccordion("promo")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                isPromoRoute
                  ? "bg-indigo-50/70 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Sparkles
                  className={`h-4.5 w-4.5 shrink-0 ${isPromoRoute ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`}
                />
                <span className="truncate">Ưu đãi & Cấu hình</span>
              </div>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 shrink-0 ${
                  openAccordions.promo
                    ? "rotate-180 text-indigo-600 dark:text-indigo-400"
                    : "text-slate-400"
                }`}
              />
            </button>

            {openAccordions.promo && (
              <div className="pl-6 space-y-1 py-1 animate-in slide-in-from-top-2 duration-150 border-l-2 border-slate-200 dark:border-white/10 ml-5">
                {promoItems.map((sub) => {
                  const SubIcon = sub.icon;
                  const isSubActive = location.pathname === sub.path;
                  return (
                    <Link
                      key={sub.path}
                      to={sub.path}
                      onClick={onClose}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-xs transition-all duration-200 ${
                        isSubActive
                          ? "bg-indigo-600 text-white shadow-sm font-semibold"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                      }`}
                    >
                      <SubIcon
                        className={`h-3.5 w-3.5 shrink-0 ${isSubActive ? "text-white" : "text-slate-400"}`}
                      />
                      <span className="truncate">{sub.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>
      </div>

      <div className="space-y-3 pt-3 mt-4 border-t border-slate-200 dark:border-white/10 shrink-0">
        {/* Controls Row: Theme Toggle + Language Flags */}
        <div className="flex items-center justify-between px-0.5">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>

        {/* Clean Admin Profile Card */}
        <div className="flex items-center gap-3 p-2.5 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5">
          <img
            className="h-9 w-9 rounded-full border-2 border-indigo-500/30 object-cover shrink-0"
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256"
            alt="Profile"
            width={36}
            height={36}
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-slate-900 dark:text-white font-bold text-xs leading-tight truncate">
              Tran Kieu Vy
            </h3>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-300 font-semibold block mt-0.5 truncate">
              {t("adminRole")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop & Tablet Fixed Height Sidebar */}
      <aside className="hidden md:flex w-64 lg:w-72 h-full bg-white dark:bg-slate-900/60 backdrop-blur-xl border-r border-slate-200 dark:border-white/10 shrink-0 transition-all">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <div className="relative w-72 max-w-[80vw] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/10 h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
});
