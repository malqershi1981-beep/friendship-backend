import { useState } from "react";
import { Package, CheckCircle, Send } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./ui/table";
import type { Order } from "../context/AppContext";
import { updateOrder } from "../lib/api";

export function WarehousePanel() {
  const { lang, t, orders, setOrders } = useApp();
  const isRtl = lang === "ar";
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [prepared, setPrepared] = useState<Record<string, Set<string>>>({});

  const warehouseOrders = orders.filter(o => o.status === "warehouse" && !o.isQuotation);

  const toggleItem = (orderId: string, productId: string) => {
    setPrepared(prev => {
      const set = new Set(prev[orderId] || []);
      if (set.has(productId)) set.delete(productId);
      else set.add(productId);
      return { ...prev, [orderId]: set };
    });
  };

  const isOrderReady = (order: Order) => {
    const prep = prepared[order.id];
    return prep && order.items.every(i => prep.has(i.product.id));
  };

  const sendToCS = async (order: Order) => {
    try {
      const updated = await updateOrder(order.id, { status: "ready" } as any);
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, ...updated } : o));
      setPrepared(prev => {
        const next = { ...prev };
        delete next[order.id];
        return next;
      });
      if (updated.status !== "warehouse") {
        setSelectedOrder(null);
      } else {
        setSelectedOrder(prev => prev ? { ...prev, ...updated, items: updated.items ?? prev.items } : updated);
      }
    } catch (error) {
      console.error("Failed to update warehouse order status:", error);
      alert(t("فشل تحديث حالة الطلب", "Failed to update order status"));
    }
  };

  return (
    <div dir={isRtl ? "rtl" : "ltr"} style={{ fontFamily: isRtl ? "Cairo, sans-serif" : "Inter, sans-serif" }} className="flex h-full flex-col md:flex-row">
      {/* List */}
      <div className="md:w-80 w-full flex-shrink-0 md:border-e border-b border-border bg-white overflow-x-auto md:overflow-y-auto">
        <div className="p-4 border-b border-border">
          <h3 style={{ fontWeight: 700, fontSize: "16px", color: "var(--primary)" }}>{t("طلبات المخزن", "Warehouse Orders")}</h3>
          <div className="text-muted-foreground" style={{ fontSize: "13px" }}>{warehouseOrders.length} {t("طلب", "orders")}</div>
        </div>
        {warehouseOrders.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Package size={40} className="mx-auto mb-3 opacity-40" />
            <p style={{ fontSize: "14px" }}>{t("لا توجد طلبات للمخزن", "No warehouse orders")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-3xl bg-white border border-border shadow-sm">
            <Table className="min-w-full">
              <TableHeader className="bg-secondary">
                <TableRow>
                  {[
                    t("رقم الطلب", "Order ID"),
                    t("العميل", "Customer"),
                    t("الأصناف", "Items"),
                    t("الإجمالي", "Total"),
                  ].map((heading, index) => (
                    <TableHead key={index} className="px-4 py-3" style={{ textAlign: isRtl ? "right" : "left" }}>{heading}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {warehouseOrders.map(order => (
                  <TableRow key={order.id} onClick={() => setSelectedOrder(order)} className={`cursor-pointer border-t border-border ${selectedOrder?.id === order.id ? "bg-primary/5" : "hover:bg-secondary/50"}`}>
                    <TableCell className="px-4 py-3 font-semibold">{order.id}</TableCell>
                    <TableCell className="px-4 py-3">{order.customerName}</TableCell>
                    <TableCell className="px-4 py-3">{order.items.length}</TableCell>
                    <TableCell className="px-4 py-3 font-bold text-primary">{order.total.toFixed(2)} $</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Detail */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {!selectedOrder ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Package size={60} className="mx-auto mb-4 opacity-40" />
              <p>{t("اختر طلباً لعرض محتوياته", "Select an order to view its contents")}</p>
            </div>
          </div>
        ) : (
          <div className="max-w-xl space-y-5">
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--primary)" }}>{selectedOrder.id}</h2>
              <div className="text-muted-foreground">{selectedOrder.customerName} — {selectedOrder.deliveryAddress}</div>
            </div>

            <div className="bg-white rounded-2xl border border-border p-5">
              <h3 style={{ fontWeight: 700, marginBottom: "16px", color: "var(--primary)" }}>
                {t("قائمة الأصناف المطلوبة", "Required Items Checklist")}
              </h3>
              <div className="space-y-3">
                {selectedOrder.items.map(item => {
                  const isPrepared = prepared[selectedOrder.id]?.has(item.product.id);
                  return (
                    <div
                      key={item.product.id}
                      onClick={() => toggleItem(selectedOrder.id, item.product.id)}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${isPrepared ? "border-green-400 bg-green-50" : "border-border bg-secondary hover:border-primary/30"}`}
                    >
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isPrepared ? "border-green-500 bg-green-500 text-white" : "border-border"}`}>
                        {isPrepared && <CheckCircle size={18} />}
                      </div>
                      <img src={item.product.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1">
                        <div style={{ fontWeight: 600 }}>{isRtl ? item.product.nameAr : item.product.nameEn}</div>
                        <div className="text-muted-foreground" style={{ fontSize: "13px" }}>
                          {t("الكمية:", "Qty:")} <strong>{item.quantity}</strong>
                        </div>
                      </div>
                      {isPrepared && <span className="text-green-600" style={{ fontSize: "13px", fontWeight: 600 }}>{t("تم التجهيز", "Prepared")}</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary border border-border">
              <div className="flex-1">
                <div style={{ fontWeight: 600 }}>{t("التقدم", "Progress")}</div>
                <div className="text-muted-foreground" style={{ fontSize: "14px" }}>
                  {prepared[selectedOrder.id]?.size || 0} / {selectedOrder.items.length} {t("أصناف جاهزة", "items ready")}
                </div>
              </div>
              <div className="w-24 bg-border rounded-full" style={{ height: "8px" }}>
                <div
                  className="bg-primary rounded-full transition-all"
                  style={{ height: "8px", width: `${((prepared[selectedOrder.id]?.size || 0) / selectedOrder.items.length) * 100}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => sendToCS(selectedOrder)}
              disabled={!isOrderReady(selectedOrder)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
              style={{ fontWeight: 700, fontSize: "16px" }}
            >
              <Send size={20} />
              {t("إرسال لخدمة العملاء (جاهز)", "Send to Customer Service (Ready)")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
