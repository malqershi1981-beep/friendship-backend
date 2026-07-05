import { useState } from "react";
import { CheckCircle, Clock, Package, Truck, Phone, MapPin, Building2, Banknote, User } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./ui/table";
import { useApp } from "../context/AppContext";
import type { Order } from "../context/AppContext";
import { updateOrder } from "../lib/api";

export function CustomerServicePanel() {
  const { lang, t, orders, setOrders, employees, banks } = useApp();
  const isRtl = lang === "ar";
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState("");

  const pending = orders.filter(o => o.status === "pending" && !o.isQuotation);
  const inProcess = orders.filter(o => ["customer_service", "ready"].includes(o.status) && !o.isQuotation);

  const activeEmployees = employees.filter(e => e.active);

  const updateStatus = async (orderId: string, status: Order["status"]) => {
    try {
      const updated = await updateOrder(orderId, { status } as any);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, ...updated, items: updated.items ?? prev.items } : null);
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
      alert(t("فشل تحديث حالة الطلب", "Failed to update order status"));
    }
  };

  const rejectOrder = async (orderId: string) => {
    try {
      const updated = await updateOrder(orderId, { status: "rejected" } as any);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, ...updated, items: updated.items ?? prev.items } : null);
      }
    } catch (error) {
      console.error("Failed to reject order:", error);
      alert(t("فشل رفض الطلب", "Failed to reject order"));
    }
  };

  const assignEmployee = async (orderId: string) => {
    if (!selectedEmployee) return;
    try {
      const updated = await updateOrder(orderId, { deliveryEmployeeId: selectedEmployee, status: "delivering" } as any);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, ...updated, items: updated.items ?? prev.items } : null);
      }
    } catch (error) {
      console.error("Failed to assign delivery employee:", error);
      alert(t("فشل إسناد موظف التوصيل", "Failed to assign delivery employee"));
    }
  };

  const orderList = [...pending, ...inProcess];

  return (
    <div dir={isRtl ? "rtl" : "ltr"} style={{ fontFamily: isRtl ? "Cairo, sans-serif" : "Inter, sans-serif" }} className="flex h-full flex-col md:flex-row">
      {/* Left: Order list */}
      <div className="w-full md:w-80 flex-shrink-0 md:border-e border-b border-border bg-white overflow-x-auto md:overflow-y-auto">
        <div className="p-4 border-b border-border">
          <h3 style={{ fontWeight: 700, fontSize: "16px", color: "var(--primary)" }}>{t("الطلبات الجديدة", "New Orders")}</h3>
          <div className="text-muted-foreground" style={{ fontSize: "13px" }}>{orderList.length} {t("طلب", "orders")}</div>
        </div>
        {orderList.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Clock size={40} className="mx-auto mb-3 opacity-40" />
            <p style={{ fontSize: "14px" }}>{t("لا توجد طلبات حالياً", "No orders at the moment")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-3xl bg-white border border-border shadow-sm">
            <Table className="min-w-full">
              <TableHeader className="bg-secondary">
                <TableRow>
                  {[
                    t("رقم الطلب", "Order ID"),
                    t("العميل", "Customer"),
                    t("الحالة", "Status"),
                    t("الإجمالي", "Total"),
                    t("التاريخ", "Date"),
                  ].map((heading, index) => (
                    <TableHead key={index} className="px-4 py-3" style={{ textAlign: isRtl ? "right" : "left" }}>{heading}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderList.map(order => (
                  <TableRow
                    key={order.id}
                    onClick={() => { setSelectedOrder(order); setSelectedEmployee(order.deliveryEmployeeId || ""); }}
                    className={`cursor-pointer ${selectedOrder?.id === order.id ? "bg-primary/5" : "hover:bg-secondary/50"}`}
                  >
                    <TableCell className="px-4 py-3 font-semibold">{order.id}</TableCell>
                    <TableCell className="px-4 py-3">{order.customerName}</TableCell>
                    <TableCell className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === "pending" ? "bg-amber-100 text-amber-700" :
                        order.status === "customer_service" ? "bg-blue-100 text-blue-700" :
                        order.status === "ready" ? "bg-green-100 text-green-700" :
                        order.status === "rejected" ? "bg-red-100 text-red-700" :
                        "bg-gray-100 text-gray-700"
                      }`} style={{ fontWeight: 600 }}>
                        {order.status === "pending" ? t("جديد", "New") :
                         order.status === "customer_service" ? t("قيد المراجعة", "Under Review") :
                         order.status === "ready" ? t("جاهز", "Ready") :
                         order.status === "rejected" ? t("مرفوض", "Rejected") : order.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 font-semibold">{order.total.toFixed(2)} $</TableCell>
                    <TableCell className="px-4 py-3 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString(isRtl ? "ar" : "en")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Right: Order details */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {!selectedOrder ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Package size={60} className="mx-auto mb-4 opacity-40" />
              <p style={{ fontSize: "16px" }}>{t("اختر طلباً لعرض تفاصيله", "Select an order to view details")}</p>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--primary)" }}>{selectedOrder.id}</h2>
                <div className="text-muted-foreground" style={{ fontSize: "14px" }}>{new Date(selectedOrder.createdAt).toLocaleString(isRtl ? "ar" : "en")}</div>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                selectedOrder.status === "pending" ? "bg-amber-100 text-amber-700" :
                selectedOrder.status === "ready" ? "bg-green-100 text-green-700" :
                "bg-blue-100 text-blue-700"
              }`}>
                {selectedOrder.status}
              </span>
            </div>

            {/* Customer info */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <h3 style={{ fontWeight: 700, marginBottom: "12px", color: "var(--primary)" }}>{t("بيانات العميل", "Customer Details")}</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2"><User size={16} className="text-muted-foreground" /><span style={{ fontWeight: 600 }}>{selectedOrder.customerName}</span></div>
                <div className="flex items-center gap-2"><Phone size={16} className="text-muted-foreground" /><span>{selectedOrder.customerPhone}</span></div>
                <div className="flex items-center gap-2"><MapPin size={16} className="text-muted-foreground" /><span>{selectedOrder.deliveryAddress}</span></div>
              </div>
            </div>

            {/* Payment info */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <h3 style={{ fontWeight: 700, marginBottom: "12px", color: "var(--primary)" }}>{t("بيانات الدفع", "Payment Details")}</h3>
              <div className="flex items-center gap-2 mb-2">
                {selectedOrder.paymentMethod === "cash" ? <Banknote size={18} className="text-green-500" /> : <Building2 size={18} className="text-blue-500" />}
                <span style={{ fontWeight: 600 }}>{selectedOrder.paymentMethod === "cash" ? t("نقداً عند التسليم", "Cash on Delivery") : t("تحويل بنكي", "Bank Transfer")}</span>
              </div>
              {selectedOrder.paymentMethod === "bank_transfer" && selectedOrder.bankId && (
                <div className="mt-2 p-3 rounded-lg bg-secondary space-y-1 text-sm">
                  <div>{t("البنك:", "Bank:")} <strong>{banks.find(b => b.id === selectedOrder.bankId)?.[isRtl ? "nameAr" : "nameEn"]}</strong></div>
                  <div>{t("رقم الحساب:", "Account:")} <strong>{banks.find(b => b.id === selectedOrder.bankId)?.accountNumber}</strong></div>
                  <div>{t("الرقم المرجعي:", "Ref:")} <strong>{selectedOrder.transferRef}</strong></div>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <h3 style={{ fontWeight: 700, marginBottom: "12px", color: "var(--primary)" }}>{t("الأصناف", "Items")}</h3>
              {selectedOrder.items.map(item => (
                <div key={item.product.id} className="flex justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <div style={{ fontWeight: 600 }}>{isRtl ? item.product.nameAr : item.product.nameEn}</div>
                    <div className="text-muted-foreground" style={{ fontSize: "13px" }}>× {item.quantity} × {item.product.price.toFixed(2)} $</div>
                  </div>
                  <div style={{ fontWeight: 700, color: "var(--accent)" }}>{(item.product.price * item.quantity).toFixed(2)} $</div>
                </div>
              ))}
              <div className="flex justify-between pt-3 mt-1">
                <span style={{ fontWeight: 700 }}>{t("الإجمالي", "Total")}</span>
                <span style={{ fontWeight: 800, fontSize: "20px", color: "var(--primary)" }}>{selectedOrder.total.toFixed(2)} $</span>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <h3 style={{ fontWeight: 700, marginBottom: "12px", color: "var(--primary)" }}>{t("الإجراءات", "Actions")}</h3>
              <div className="space-y-3">
                {selectedOrder.status === "pending" && (
                  <div className="space-y-2">
                    <button onClick={() => updateStatus(selectedOrder.id, "customer_service")} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity" style={{ fontWeight: 600 }}>
                      <CheckCircle size={18} />
                      {t("قبول الطلب ومراجعته", "Accept & Review Order")}
                    </button>
                    <button onClick={() => rejectOrder(selectedOrder.id)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 text-white hover:opacity-90 transition-opacity" style={{ fontWeight: 600 }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      {t("رفض الطلب", "Reject Order")}
                    </button>
                  </div>
                )}
                {selectedOrder.status === "customer_service" && (
                  <button onClick={() => updateStatus(selectedOrder.id, "warehouse")} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity" style={{ fontWeight: 600 }}>
                    <Package size={18} />
                    {t("إرسال للمخزن", "Send to Warehouse")}
                  </button>
                )}
                {selectedOrder.status === "ready" && (
                  <div className="space-y-3">
                    <select
                      value={selectedEmployee}
                      onChange={e => setSelectedEmployee(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="">{t("-- اختر موظف التوصيل --", "-- Select Delivery Employee --")}</option>
                      {activeEmployees.map(e => (
                        <option key={e.id} value={e.id}>{isRtl ? e.nameAr : e.nameEn} — {e.phone}</option>
                      ))}
                    </select>
                    <button onClick={() => assignEmployee(selectedOrder.id)} disabled={!selectedEmployee} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40" style={{ fontWeight: 600 }}>
                      <Truck size={18} />
                      {t("إسناد لموظف التوصيل", "Assign Delivery Employee")}
                    </button>
                  </div>
                )}
                {["delivering", "delivered", "closed"].includes(selectedOrder.status) && (
                  <div className="flex items-center gap-2 text-green-600 p-3 rounded-xl bg-green-50">
                    <CheckCircle size={20} />
                    <span style={{ fontWeight: 600 }}>{t("الطلب مكتمل أو قيد التوصيل", "Order completed or out for delivery")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
