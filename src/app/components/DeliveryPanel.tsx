import { useApp } from "../context/AppContext";
import { CheckCircle, MapPin, Phone, User, Package, Banknote, Building2 } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./ui/table";
import type { Order } from "../context/AppContext";
import { updateOrder } from "../lib/api";

export function DeliveryPanel() {
  const { lang, t, orders, setOrders, currentUser, employees } = useApp();
  const isRtl = lang === "ar";

  const employee =
    employees.find(e => {
      const name = isRtl ? e.nameAr : e.nameEn;
      const staffName = currentUser ? (isRtl ? currentUser.nameAr : currentUser.nameEn) : "";
      return name === staffName;
    }) || employees.find(e => e.active);

  const myOrders = orders.filter(
    o =>
      o.status === "delivering" &&
      !o.isQuotation &&
      (employee ? o.deliveryEmployeeId === employee.id : true)
  );

  const markDelivered = async (order: Order) => {
    try {
      const updated = await updateOrder(order.id, { status: "delivered" } as any);
      setOrders(prev => prev.map(o => (o.id === order.id ? { ...o, ...updated } : o)));
    } catch (error) {
      console.error("Failed to mark order delivered:", error);
      alert(t("فشل تحديث حالة الطلب", "Failed to update order status"));
    }
  };

  const closeOrder = async (order: Order) => {
    try {
      const updated = await updateOrder(order.id, { status: "closed" } as any);
      setOrders(prev => prev.map(o => (o.id === order.id ? { ...o, ...updated } : o)));
    } catch (error) {
      console.error("Failed to close order:", error);
      alert(t("فشل إغلاق الطلب", "Failed to close order"));
    }
  };

  const delivered = orders.filter(
    o =>
      (o.status === "delivered" || o.status === "closed") &&
      !o.isQuotation &&
      (employee ? o.deliveryEmployeeId === employee.id : true)
  );

  // ✅ فلترة الطلبات المسلَّمة لليوم فقط
  const today = new Date();
  const deliveredToday = delivered.filter((order: Order) => {
    const orderDate = new Date(order.deliveredAt || order.createdAt);
    return orderDate.toDateString() === today.toDateString();
  });

  return (
<div dir={isRtl ? "rtl" : "ltr"} style={{ fontFamily: isRtl ? "Cairo, sans-serif" : "Inter, sans-serif" }} className="p-4 md:p-6 overflow-y-auto h-full">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h2 style={{ fontSize: "26px", fontWeight: 800, color: "var(--primary)", marginBottom: "4px" }}>
            {t("شاشة التوصيل", "Delivery Screen")}
          </h2>
          {employee && (
            <p className="text-muted-foreground">
              {t("الموظف:", "Employee:")} <strong>{isRtl ? employee.nameAr : employee.nameEn}</strong> — {employee.phone}
            </p>
          )}
        </div>

        {/* Active deliveries */}
        <div className="mb-8">
          <h3 style={{ fontWeight: 700, fontSize: "18px", color: "var(--primary)", marginBottom: "16px" }}>
            {t("طلبات قيد التوصيل", "Active Deliveries")} ({myOrders.length})
          </h3>
          {myOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border p-10 text-center text-muted-foreground">
              <Package size={50} className="mx-auto mb-3 opacity-40" />
              <p>{t("لا توجد طلبات للتوصيل حالياً", "No active deliveries at the moment")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myOrders.map(order => (
                <div key={order.id} className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
                  {/* Header */}
                  <div className="bg-primary/5 border-b border-border px-5 py-3 flex items-center justify-between">
                    <span style={{ fontWeight: 700, color: "var(--primary)", fontSize: "16px" }}>{order.id}</span>
                    <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700" style={{ fontWeight: 600 }}>
                      {t("في الطريق", "Out for Delivery")}
                    </span>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Customer info */}
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User size={18} className="text-primary" />
                        </div>
                        <div>
                          <div className="text-muted-foreground" style={{ fontSize: "12px" }}>{t("اسم العميل", "Customer Name")}</div>
                          <div style={{ fontWeight: 700 }}>{order.customerName}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Phone size={18} className="text-primary" />
                        </div>
                        <div>
                          <div className="text-muted-foreground" style={{ fontSize: "12px" }}>{t("رقم الهاتف", "Phone")}</div>
                          <a href={`tel:${order.customerPhone}`} className="text-accent" style={{ fontWeight: 700 }}>{order.customerPhone}</a>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <MapPin size={18} className="text-primary" />
                        </div>
                        <div>
                          <div className="text-muted-foreground" style={{ fontSize: "12px" }}>{t("عنوان التوصيل", "Delivery Address")}</div>
                          <div style={{ fontWeight: 600 }}>{order.deliveryAddress}</div>
                        </div>
                      </div>
                    </div>

                    {/* Payment status */}
                    <div className={`flex items-center gap-3 p-4 rounded-xl border-2 ${order.paymentMethod === "bank_transfer" ? "border-green-300 bg-green-50" : "border-amber-300 bg-amber-50"}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${order.paymentMethod === "bank_transfer" ? "bg-green-500" : "bg-amber-500"}`}>
                        {order.paymentMethod === "bank_transfer" ? <Building2 size={20} className="text-white" /> : <Banknote size={20} className="text-white" />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "16px" }} className={order.paymentMethod === "bank_transfer" ? "text-green-700" : "text-amber-700"}>
                          {order.paymentMethod === "bank_transfer" ? t("✓ تم الدفع (تحويل بنكي)", "✓ Paid (Bank Transfer)") : t("✗ لم يتم الدفع (نقداً عند التسليم)", "✗ Not Paid (Cash on Delivery)")}
                        </div>
                        <div className="text-muted-foreground" style={{ fontSize: "13px" }}>
                          {t("المبلغ:", "Amount:")} <strong>{order.total.toFixed(2)} $</strong>
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: "10px", color: "var(--primary)" }}>{t("الأصناف", "Items")}</div>
                      <div className="space-y-2">
                        {order.items.map(item => (
                          <div key={item.product.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary">
                            <img src={item.product.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div style={{ fontWeight: 600, fontSize: "14px" }}>{isRtl ? item.product.nameAr : item.product.nameEn}</div>
                            </div>
                            <div className="text-muted-foreground" style={{ fontSize: "14px" }}>× {item.quantity}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Deliver button */}
                    <button
                      onClick={() => markDelivered(order)}
                      className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors"
                      style={{ fontWeight: 700, fontSize: "17px" }}
                    >
                      <CheckCircle size={22} />
                      {t("تم التسليم", "Mark as Delivered")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* ✅ Delivered orders today */}
        {deliveredToday.length > 0 && (
          <div>
            <h3
              style={{
                fontWeight: 700,
                fontSize: "18px",
                color: "var(--primary)",
                marginBottom: "16px",
              }}
            >
              {t("الطلبات المسلَّمة اليوم", "Delivered Orders Today")} ({deliveredToday.length})
            </h3>
            <div className="overflow-x-auto rounded-3xl bg-white border border-border shadow-sm">
              <Table className="min-w-full">
                <TableHeader className="bg-secondary">
                  <TableRow>
                    {[
                      t("رقم الطلب", "Order ID"),
                      t("العميل", "Customer"),
                      t("الإجمالي", "Total"),
                      t("الحالة", "Status"),
                      t("إجراء", "Action"),
                    ].map((heading, index) => (
                      <TableHead
                        key={index}
                        className="px-4 py-3"
                        style={{ textAlign: isRtl ? "right" : "left" }}
                      >
                        {heading}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveredToday.map((order: Order) => (
                    <TableRow key={order.id} className="border-t border-border">
                      <TableCell className="px-4 py-3 font-semibold">{order.id}</TableCell>
                      <TableCell className="px-4 py-3">{order.customerName}</TableCell>
                      <TableCell className="px-4 py-3 font-bold text-primary">
                        {order.total.toFixed(2)} $
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <span
                          className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700"
                          style={{ fontWeight: 600 }}
                        >
                          {order.status === "closed"
                            ? t("مغلق", "Closed")
                            : t("تم التسليم", "Delivered")}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {order.status === "delivered" ? (
                          <button
                            onClick={() => closeOrder(order)}
                            className="px-3 py-2 rounded-xl bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
                          >
                            {t("إغلاق", "Close")}
                          </button>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
