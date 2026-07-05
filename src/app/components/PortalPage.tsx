import { LogOut, LayoutDashboard, Headphones, Package, Truck } from "lucide-react";
import { useApp } from "../context/AppContext";
import { AdminPanel } from "./AdminPanel";
import { CustomerServicePanel } from "./CustomerServicePanel";
import { WarehousePanel } from "./WarehousePanel";
import { DeliveryPanel } from "./DeliveryPanel";

export function PortalPage() {
  const { lang, t, currentUser, logout, newOrdersCount, setNewOrdersCount } = useApp();
  const isRtl = lang === "ar";

  if (!currentUser) return null;

  const roleLabel: Record<string, { ar: string; en: string; icon: React.ReactNode; color: string }> = {
    admin: { ar: "مدير النظام", en: "System Admin", icon: <LayoutDashboard size={18} />, color: "bg-purple-600" },
    customer_service: { ar: "خدمة العملاء", en: "Customer Service", icon: <Headphones size={18} />, color: "bg-blue-600" },
    warehouse: { ar: "المخازن", en: "Warehouse", icon: <Package size={18} />, color: "bg-amber-600" },
    delivery: { ar: "التوصيل", en: "Delivery", icon: <Truck size={18} />, color: "bg-green-600" },
  };

  const role = currentUser.role || "admin";
  const info = roleLabel[role];

  const panelTitle: Record<string, { ar: string; en: string }> = {
    admin: { ar: "لوحة التحكم", en: "Admin Panel" },
    customer_service: { ar: "شاشة خدمة العملاء", en: "Customer Service Panel" },
    warehouse: { ar: "شاشة المخازن", en: "Warehouse Panel" },
    delivery: { ar: "شاشة التوصيل", en: "Delivery Panel" },
  };

  return (
    <div dir={isRtl ? "rtl" : "ltr"} style={{ fontFamily: isRtl ? "Cairo, sans-serif" : "Inter, sans-serif" }} className="flex flex-col h-screen overflow-hidden">
      {/* Portal header */}
      <div className="bg-primary text-primary-foreground px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${info.color}`}>
            {info.icon}
            <span style={{ fontWeight: 600, fontSize: "14px" }}>{isRtl ? info.ar : info.en}</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: "18px" }}>{isRtl ? panelTitle[role].ar : panelTitle[role].en}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="opacity-80" style={{ fontSize: "14px" }}>
            {isRtl ? currentUser.nameAr : currentUser.nameEn}
          </span>
          <button onClick={logout} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/15 hover:bg-white/25 transition-colors" style={{ fontSize: "14px", fontWeight: 600 }}>
            <LogOut size={16} />
            {t("خروج", "Sign Out")}
          </button>
        </div>
      </div>

      {newOrdersCount > 0 && (
        <div className="bg-white/95 border-b border-slate-200 px-6 py-4 text-sm text-slate-700 flex items-center justify-between gap-4">
          <div>
            <div className="font-semibold">{t("طلبات جديدة", "New Orders")}</div>
            <div className="text-muted-foreground" style={{ fontSize: 13 }}>{t("يوجد", "There are")} {newOrdersCount} {t("طلبات جديدة", "new orders")}</div>
          </div>
          <button onClick={() => setNewOrdersCount(0)} className="rounded-lg bg-primary px-4 py-2 text-white text-sm hover:bg-primary/90 transition-colors">
            {t("تم الاطلاع", "Mark as read")}
          </button>
        </div>
      )}

      {/* Panel content */}
      <div className="flex-1 overflow-hidden">
        {role === "admin" && <AdminPanel />}
        {role === "customer_service" && <CustomerServicePanel />}
        {role === "warehouse" && <WarehousePanel />}
        {role === "delivery" && <DeliveryPanel />}
      </div>
    </div>
  );
}
