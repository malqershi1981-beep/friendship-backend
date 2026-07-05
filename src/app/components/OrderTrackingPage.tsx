import { useState } from "react";
import { Search, Package, CheckCircle, Clock, Truck, Home, Star, XCircle } from "lucide-react";
import { useApp } from "../context/AppContext";
import type { OrderStatus } from "../context/AppContext";

const statusSteps: { key: OrderStatus; ar: string; en: string; icon: React.ReactNode }[] = [
  { key: "pending", ar: "في الانتظار", en: "Pending", icon: <Clock size={20} /> },
  { key: "customer_service", ar: "عند خدمة العملاء", en: "At Customer Service", icon: <Star size={20} /> },
  { key: "rejected", ar: "الطلب مرفوض", en: "Rejected", icon: <XCircle size={20} /> },
  { key: "warehouse", ar: "في المخازن", en: "In Warehouse", icon: <Package size={20} /> },
  { key: "ready", ar: "جاهز للتسليم", en: "Ready for Delivery", icon: <CheckCircle size={20} /> },
  { key: "delivering", ar: "في الطريق", en: "Out for Delivery", icon: <Truck size={20} /> },
  { key: "delivered", ar: "تم التسليم", en: "Delivered", icon: <Home size={20} /> },
];

const statusOrder: OrderStatus[] = ["pending", "customer_service", "rejected", "warehouse", "ready", "delivering", "delivered", "closed"];

export function OrderTrackingPage() {
  const { lang, t, orders, employees } = useApp();
  const isRtl = lang === "ar";
  const { trackOrderId, setTrackOrderId } = useApp();
  const [searchId, setSearchId] = useState(trackOrderId || "");
  const [searched, setSearched] = useState(!!trackOrderId);

  const foundOrder = orders.find(o => {
  if (o.id !== searchId.trim()) return false;
  if (o.isQuotation ) return false;
  return true;
});
  const deliveryEmployee = foundOrder?.deliveryEmployeeId ? employees.find(e => e.id === foundOrder.deliveryEmployeeId) : null;

  const currentStepIndex = foundOrder ? statusOrder.indexOf(foundOrder.status) : -1;
  const trackSteps = statusSteps;

  return (
    <div dir={isRtl ? "rtl" : "ltr"} style={{ fontFamily: isRtl ? "Cairo, sans-serif" : "Inter, sans-serif" }} className="bg-background min-h-screen">
      {/* Hero */}
      <div className="bg-primary py-14 text-white text-center">
        <h1 style={{ fontSize: "36px", fontWeight: 800, marginBottom: "10px" }}>{t("تتبع طلبك", "Track Your Order")}</h1>
        <p className="opacity-80">{t("أدخل رقم الطلب لمعرفة حالته الحالية", "Enter your order ID to check its current status")}</p>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-border p-6 mb-8">
          <label className="block mb-3" style={{ fontSize: "15px", fontWeight: 700, color: "var(--primary)" }}>
            {t("رقم الطلب", "Order ID")}
          </label>
            <div className="flex gap-3">
            <input
              value={searchId}
              onChange={e => setSearchId(e.target.value)}
              placeholder="ORD-..."
              className="flex-1 px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              style={{ fontSize: "15px" }}
              onKeyDown={e => { if (e.key === "Enter") setSearched(true); }}
            />
            <button onClick={() => { setSearched(true); setTrackOrderId(searchId.trim()); }} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity" style={{ fontWeight: 600 }}>
              <Search size={18} />
              {t("بحث", "Search")}
            </button>
          </div>
        </div>

        {searched && !foundOrder && (
          <div className="bg-white rounded-2xl shadow-sm border border-border p-10 text-center">
            <Package size={60} className="mx-auto mb-4 text-muted-foreground opacity-40" />
            <h3 style={{ fontSize: "20px", fontWeight: 700, color: "var(--foreground)", marginBottom: "8px" }}>
              {t("لم يتم العثور على الطلب", "Order Not Found")}
            </h3>
            <p className="text-muted-foreground">{t("تأكد من رقم الطلب وحاول مرة أخرى", "Please verify the order ID and try again")}</p>
          </div>
        )}

        {foundOrder && (
          <div className="space-y-6">
            {/* Order info */}
            <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-muted-foreground" style={{ fontSize: "13px" }}>{t("رقم الطلب", "Order ID")}</div>
                  <div style={{ fontWeight: 700, fontSize: "20px", color: "var(--primary)" }}>{foundOrder.id}</div>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                  foundOrder.status === "delivered" || foundOrder.status === "closed" ? "bg-green-100 text-green-700" :
                  foundOrder.status === "delivering" ? "bg-blue-100 text-blue-700" :
                  "bg-amber-100 text-amber-700"
                }`}>
                  {trackSteps.find(s => s.key === foundOrder.status)?.ar || foundOrder.status}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">{t("العميل", "Customer")}</div>
                  <div style={{ fontWeight: 600 }}>{foundOrder.customerName}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">{t("التاريخ", "Date")}</div>
                  <div style={{ fontWeight: 600 }}>{new Date(foundOrder.createdAt).toLocaleDateString(isRtl ? "ar" : "en")}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">{t("الإجمالي", "Total")}</div>
                  <div style={{ fontWeight: 600, color: "var(--accent)" }}>{foundOrder.total.toFixed(2)} $</div>
                </div>
                <div>
                  <div className="text-muted-foreground">{t("طريقة الدفع", "Payment")}</div>
                  <div style={{ fontWeight: 600 }}>{foundOrder.paymentMethod === "cash" ? t("نقداً", "Cash") : t("تحويل بنكي", "Bank Transfer")}</div>
                </div>
              </div>
            </div>

            {/* Status timeline */}
            {!foundOrder.isQuotation && (
              <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--primary)", marginBottom: "20px" }}>
                  {t("مراحل الطلب", "Order Progress")}
                </h3>
                <div className="space-y-3">
                  {trackSteps.map((step, idx) => {
                    const isComplete = currentStepIndex > idx;
                    const isCurrent = statusOrder[currentStepIndex] === step.key;
                    return (
                      <div key={step.key} className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                          isComplete ? "bg-green-500 text-white" :
                          isCurrent ? "bg-primary text-white" :
                          "bg-secondary text-muted-foreground"
                        }`}>
                          {isComplete ? <CheckCircle size={20} /> : step.icon}
                        </div>
                        <div className="flex-1">
                          <div style={{ fontWeight: isCurrent ? 700 : 500, color: isCurrent ? "var(--primary)" : isComplete ? "var(--foreground)" : "var(--muted-foreground)" }}>
                            {isRtl ? step.ar : step.en}
                          </div>
                        </div>
                        {isCurrent && (
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary" style={{ fontWeight: 600 }}>
                            {t("الحالة الحالية", "Current")}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Delivery employee */}
            {deliveryEmployee && (foundOrder.status === "delivering" || foundOrder.status === "delivered") && (
              <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--primary)", marginBottom: "16px" }}>
                  {t("موظف التوصيل", "Delivery Employee")}
                </h3>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <Truck size={28} className="text-primary" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "18px" }}>{isRtl ? deliveryEmployee.nameAr : deliveryEmployee.nameEn}</div>
                    <a href={`tel:${deliveryEmployee.phone}`} className="text-accent flex items-center gap-1" style={{ fontWeight: 600 }}>
                      📞 {deliveryEmployee.phone}
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Items */}
            <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--primary)", marginBottom: "16px" }}>
                {t("تفاصيل الطلب", "Order Items")}
              </h3>
              {foundOrder.items.map(item => (
                <div key={item.product.id} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
                  <img src={item.product.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <div style={{ fontWeight: 600 }}>{isRtl ? item.product.nameAr : item.product.nameEn}</div>
                    <div className="text-muted-foreground" style={{ fontSize: "13px" }}>× {item.quantity}</div>
                  </div>
                  <div style={{ fontWeight: 600, color: "var(--accent)" }}>
                    {(item.product.price * item.quantity).toFixed(2)} $
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
