import { useState } from "react";
import { Search, FileText, ShoppingCart, CheckCircle, Building2, Banknote, Mail } from "lucide-react";
import { useApp } from "../context/AppContext";
import type { Order } from "../context/AppContext";
import { createOrder, updateOrder } from "../lib/api";
import { jsPDF } from "jspdf";
import { drawPdfText, drawPdfLabelValue } from "../lib/pdfUtils";
import { CompanyLogo } from "./CompanyLogo";
import heroImage from "../../imports/_______2.png";


export function QuotationPurchasePage() {
  const { lang, t, orders, setOrders, banks, currency } = useApp();
  const isRtl = lang === "ar";

  const [searchId, setSearchId] = useState("");
  const [searched, setSearched] = useState(false);
  const [step, setStep] = useState<"search" | "checkout" | "success">("search");
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "bank_transfer">("cash");
  const [selectedBank, setSelectedBank] = useState("");
  const [transferRef, setTransferRef] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const activeBanks = banks.filter(b => b.active);
  const foundQuotation = orders.find(o => {
  if (o.id !== searchId.trim()) return false;
  if (!o.isQuotation) return false;
  if (o.status !== "pending") return false;

  // حساب تاريخ انتهاء العرض
  const created = new Date(o.createdAt);
  const expiry = new Date(created);
  expiry.setDate(expiry.getDate() + (o.quotationValidity || 0));

  // إذا العرض انتهى مدته → لا يظهر
  if (new Date() > expiry) return false;

  return true;
});


  

  const startCheckout = () => {
    if (!foundQuotation) return;
    setCustomerName(foundQuotation.customerName);
    setCustomerPhone(foundQuotation.customerPhone);
    setCustomerEmail(foundQuotation.customerEmail || "");
    setDeliveryAddress(foundQuotation.deliveryAddress || "");
    setStep("checkout");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundQuotation) return;
    const status: "pending" = "pending";
    const payload = {
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      items: foundQuotation.items.map(item => ({ product: item.product, quantity: item.quantity, price: item.product.price })),
      total: foundQuotation.total,
      paymentMethod,
      bankId: paymentMethod === "bank_transfer" ? selectedBank : undefined,
      transferRef: paymentMethod === "bank_transfer" ? transferRef : undefined,
      status,
      isQuotation: false,
      quotationValidity: undefined,
    };

    try {
      const created = await createOrder(payload);
      setOrders(prev => [...prev, created]);
      setCreatedOrder(created);
      if (customerEmail) setEmailSent(true);

      // 2️⃣ تحديث عرض السعر الأصلي إلى closed
      const updatedQuotation = await updateOrder(foundQuotation.id, { status: "closed" });
      setOrders(prev => prev.map(order => order.id === updatedQuotation.id ? updatedQuotation : order));

      setStep("success");
    } catch (error) {
      console.error("Failed to create purchase order:", error);
      alert(isRtl ? "فشل إنشاء طلب الشراء، حاول مرة أخرى." : "Failed to create purchase order, please try again.");
    }
  };

  const downloadPDF = () => {
    if (!createdOrder) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const width = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const right = width - margin;
    const logoSize = 64;
    const headerHeight = 150;
    const orderLabel = t(": رقم الطلب", "Order ID:");
    const dateLabel = t(": التاريخ", "Date:");
    const customerLabel = t(": العميل", "Customer:");
    const phoneLabel = t(": الهاتف", "Phone:");
    const emailLabel = t(": البريد الإلكتروني", "Email:");
    const addressLabel = t(": العنوان", "Address:");
    const itemLabel = t("المنتج", "Item");
    const qtyLabel = t("الكمية", "Qty");
    const unitPriceLabel = t("سعر الوحدة", "Unit Price");
    const totalLabel = t("الإجمالي", "Total");
    const totalDueLabel = t("المبلغ الإجمالي", "Total Due");
    const headerX = isRtl ? right : margin;
    const headerAlign: CanvasTextAlign = isRtl ? "right" : "left";
    const detailX = isRtl ? right : margin;
    const detailAlign: CanvasTextAlign = isRtl ? "right" : "left";
    const footerMessageX = isRtl ? right : margin;
    const footerMessageAlign: CanvasTextAlign = isRtl ? "right" : "left";
    const footerPageX = isRtl ? margin : right;
    const footerPageAlign: CanvasTextAlign = isRtl ? "left" : "right";

    const headerDate = (() => {
      const d = new Date(createdOrder.createdAt);
      return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    })();

    const headerSectionHeight = 136;
    const whitePanelTop = 108;
    const whitePanelHeight = 48;
    const logoX = isRtl ? margin + 16 : right - margin - logoSize - 16;
    const logoY = whitePanelTop - logoSize / 2 + 6;
    const logoCenterX = logoX + logoSize / 2;
    const logoCenterY = logoY + logoSize / 2;

    doc.setFillColor(13, 30, 64);
    doc.rect(0, 0, width, headerSectionHeight, "F");

    doc.setFillColor(255, 255, 255);
    doc.rect(margin, whitePanelTop, right - margin, whitePanelHeight, "F");

    doc.setFont("helvetica", "bold").setFontSize(18);
    drawPdfText(doc, t("طلب شراء", "Purchase Order"), headerX, 32, { align: headerAlign, fontSize: 18, dir: isRtl ? "rtl" : "ltr", color: "#FFFFFF" });
    if (isRtl) {
      drawPdfLabelValue(doc, orderLabel, createdOrder.id, headerX, 56, {
        fontSize: 11,
        color: "#FFFFFF",
        labelDir: "rtl",
        valueDir: "ltr",
        anchor: "right",
        rightBound: right,
        maxWidth: right - margin,
      });
    } else {
      drawPdfLabelValue(doc, orderLabel, createdOrder.id, headerX, 56, {
        fontSize: 11,
        color: "#FFFFFF",
        labelDir: "ltr",
        valueDir: "ltr",
        anchor: "left",
        maxWidth: right - margin,
      });
    }
    drawPdfLabelValue(doc, dateLabel, headerDate, headerX, 74, {
      fontSize: 11,
      color: "#FFFFFF",
      labelDir: isRtl ? "rtl" : "ltr",
      valueDir: "ltr",
      anchor: isRtl ? "right" : "left",
      rightBound: right,
      maxWidth: right - margin,
    });

    doc.setFont("helvetica", "bold").setFontSize(16);
    drawPdfText(doc, t("الصداقة للتجاره", "FriendShip Trading"), width / 2, whitePanelTop + 12, { align: "center", fontSize: 16, color: "#000000", dir: isRtl ? "rtl" : "ltr", maxWidth: right - margin - logoSize - 24 });
    doc.setFont("helvetica", "normal").setFontSize(11);
    drawPdfText(doc, t("الوكالات العامة", "General Agencies"), width / 2, whitePanelTop + 30, { align: "center", fontSize: 11, color: "#000000", dir: isRtl ? "rtl" : "ltr", maxWidth: right - margin - logoSize - 24 });

    // draw logo after the white panel so it appears on top
    try {
      const img = (doc as any).getImage?.(heroImage) || heroImage;
      doc.addImage(img, "PNG", logoX, logoY, logoSize, logoSize);
    } catch (e) {
      doc.setFillColor(21, 49, 89);
      doc.circle(logoCenterX, logoCenterY, logoSize / 2, "F");
      doc.setDrawColor(212, 168, 32);
      doc.setLineWidth(3);
      doc.circle(logoCenterX, logoCenterY, logoSize / 2 - 2, "S");
      doc.setFillColor(196, 154, 32);
      doc.circle(logoCenterX - 14, logoCenterY, 3, "F");
      doc.circle(logoCenterX + 14, logoCenterY, 3, "F");
      doc.circle(logoCenterX, logoCenterY + 14, 3, "F");
      doc.setFont("helvetica", "bold").setFontSize(24).setTextColor(255, 255, 255);
      doc.text(isRtl ? "ص" : "F", logoCenterX, logoCenterY + 7, { align: "center" } as any);
    }

    let detailY = whitePanelTop + whitePanelHeight + 18;
    doc.setDrawColor(200);
    doc.setLineWidth(0.5);
    doc.line(margin, detailY - 10, right, detailY - 10);
    doc.setFont("helvetica", "bold").setFontSize(11);
    detailY += drawPdfLabelValue(doc, customerLabel, createdOrder.customerName, detailX, detailY, {
      fontSize: 11,
      labelDir: isRtl ? "rtl" : "ltr",
      valueDir: isRtl ? "rtl" : "ltr",
      anchor: isRtl ? "right" : "left",
      rightBound: right,
      maxWidth: right - margin,
    });
    doc.setFont("helvetica", "normal").setFontSize(11);
    detailY += 4;
    detailY += drawPdfLabelValue(doc, phoneLabel, createdOrder.customerPhone, detailX, detailY, {
      fontSize: 11,
      labelDir: isRtl ? "rtl" : "ltr",
      valueDir: "ltr",
      anchor: isRtl ? "right" : "left",
      rightBound: right,
      maxWidth: right - margin,
    });
    if (createdOrder.customerEmail) {
      detailY += 4;
      detailY += drawPdfLabelValue(doc, emailLabel, createdOrder.customerEmail, detailX, detailY, {
        fontSize: 11,
        labelDir: isRtl ? "rtl" : "ltr",
        valueDir: "ltr",
        anchor: isRtl ? "right" : "left",
        rightBound: right,
        maxWidth: right - margin,
      });
    }
    detailY += 4;
    detailY += drawPdfLabelValue(doc, addressLabel, createdOrder.deliveryAddress, detailX, detailY, {
      fontSize: 11,
      labelDir: isRtl ? "rtl" : "ltr",
      valueDir: isRtl ? "rtl" : "ltr",
      anchor: isRtl ? "right" : "left",
      rightBound: right,
      maxWidth: right - margin,
    });

    const tableTop = detailY + 14;
    doc.setFillColor(240, 241, 244);
    doc.rect(margin, tableTop - 16, right - margin, 24, "F");
    doc.setFont("helvetica", "bold").setTextColor(0).setFontSize(11);
    const itemColumnWidth = 260;
    const itemColumnRight = margin + itemColumnWidth - 2;
    const itemLabelX = isRtl ? itemColumnRight : margin + 2;
    const itemLabelAlign = isRtl ? "right" : "left";
    drawPdfText(doc, itemLabel, itemLabelX, tableTop, { align: itemLabelAlign as any, fontSize: 11, dir: isRtl ? "rtl" : "ltr", maxWidth: itemColumnWidth });
    const qtyX = 360;
    const unitPriceX = 460;
    const totalX = right;
    const headerTextY = isRtl ? tableTop - 2 : tableTop;
    drawPdfText(doc, qtyLabel, qtyX, headerTextY, { align: "center", fontSize: 11 });
    drawPdfText(doc, unitPriceLabel, unitPriceX, headerTextY, { align: "center", fontSize: 11 });
    drawPdfText(doc, totalLabel, totalX, headerTextY, { align: "right", fontSize: 11, dir: isRtl ? "rtl" : "ltr" });
    doc.line(margin, tableTop + 6, right, tableTop + 6);

    let y = tableTop + 24;
    doc.setFont("helvetica", "normal").setFontSize(11);
    const formatCurrency = (value: number) => `${currency}${value.toFixed(2)}`;

    createdOrder.items.forEach(item => {
      const name = isRtl ? item.product.nameAr : item.product.nameEn;
      const itemLineHeight = 14;
      const itemLines: string[] = doc.splitTextToSize(name, itemColumnWidth);
      let rowHeight = 0;
      itemLines.forEach((line: string, index: number) => {
        const lineHeight = drawPdfText(doc, line, isRtl ? itemColumnRight : margin + 2, y + index * itemLineHeight, {
          align: isRtl ? "right" : "left",
          dir: isRtl ? "rtl" : "ltr",
          fontSize: 11,
          maxWidth: itemColumnWidth,
        });
        rowHeight = Math.max(rowHeight, lineHeight);
      });
      if (rowHeight === 0) {
        rowHeight = itemLineHeight;
      }
      drawPdfText(doc, String(item.quantity), 360, y, { align: "center", fontSize: 11 });
      drawPdfText(doc, formatCurrency(item.product.price), 460, y, { align: "center", fontSize: 11 });
      drawPdfText(doc, formatCurrency(item.product.price * item.quantity), right, y, { align: "right", fontSize: 11 });
      y += rowHeight + 4;
      if (y > doc.internal.pageSize.getHeight() - 80) {
        doc.addPage();
        y = margin;
      }
    });

    doc.line(margin, y, right, y);
    y += 18;
    doc.setFont("helvetica", "bold").setFontSize(13);
    drawPdfText(doc, totalDueLabel, 460, y, { align: "center", fontSize: 13, dir: isRtl ? "rtl" : "ltr" });
    drawPdfText(doc, formatCurrency(createdOrder.total), right, y, { align: "right", fontSize: 13 });

    const paymentLabel = t("طريقة الدفع:", "Payment Method:");
    const paymentValue = createdOrder.paymentMethod === "bank_transfer"
      ? t("تحويل بنكي", "Bank Transfer")
      : t("نقداً عند التسليم", "Cash on Delivery");

    y += 20;
    doc.setFont("helvetica", "normal").setFontSize(10);
    drawPdfText(doc, `${paymentLabel} ${paymentValue}`, detailX, y, {
      align: detailAlign,
      fontSize: 10,
      dir: isRtl ? "rtl" : "ltr",
      maxWidth: right - margin,
    });

    const pageCount = (doc.internal as any).getNumberOfPages?.() ?? 1;
    for (let page = 1; page <= pageCount; page += 1) {
      doc.setPage(page);
      const footerY = pageHeight - 36;
      doc.setDrawColor(220);
      doc.setLineWidth(0.5);
      doc.line(margin, footerY - 10, right, footerY - 10);
      doc.setFont("helvetica", "normal").setFontSize(9);
      drawPdfText(doc, t("شكراً لتعاملكم معنا", "Thank you for doing business with us"), footerMessageX, footerY, {
        align: footerMessageAlign,
        fontSize: 9,
        dir: isRtl ? "rtl" : "ltr",
        maxWidth: (right - margin) / 2,
      });
      drawPdfText(doc, `${t("الصفحة", "Page")} ${page} / ${pageCount}`, footerPageX, footerY, {
        align: footerPageAlign,
        fontSize: 9,
      });
    }

    doc.save(`purchase-order-${createdOrder.id}.pdf`);
  };

  if (step === "success" && createdOrder) {
    return (
      <div dir={isRtl ? "rtl" : "ltr"} style={{ fontFamily: isRtl ? "Cairo, sans-serif" : "Inter, sans-serif" }} className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl border border-border p-10 max-w-lg w-full text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "linear-gradient(135deg, #0D1E40, #1E3A6E)" }}>
            <CheckCircle size={32} className="text-white" />
          </div>
          <h2 style={{ fontSize: "26px", fontWeight: 800, color: "var(--primary)", marginBottom: "10px" }}>
            {t("تم إنشاء طلب الشراء", "Purchase Order Created")}
          </h2>
          <div className="inline-block px-5 py-2 rounded-full border border-primary/20 mb-4" style={{ background: "rgba(13,30,64,0.06)" }}>
            <span className="text-muted-foreground text-sm">{t("رقم الطلب:", "Order ID:")}</span>{" "}
            <strong className="text-primary text-lg">{createdOrder.id}</strong>
          </div>
          {emailSent && createdOrder.customerEmail && (
            <div className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-green-50 border border-green-200 text-green-700 mb-5 text-sm font-semibold">
              <Mail size={16} />
              {t(`تم إرسال رقم الطلب إلى ${createdOrder.customerEmail}`, `Order ID sent to ${createdOrder.customerEmail}`)}
            </div>
          )}
          <div className="bg-secondary rounded-2xl p-4 mb-6 text-sm text-muted-foreground">
            {t("تم تحويل عرض السعر إلى طلب شراء وسيتم متابعته مع فريق خدمة العملاء", "Quotation successfully converted to a purchase order and will be processed by our team.")}
          </div>
          <div className="flex flex-col gap-3">
            <button onClick={downloadPDF} className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-bold hover:opacity-90" style={{ background: "linear-gradient(135deg, #0D1E40, #1E3A6E)" }}>
              <FileText size={18} /> {t("تنزيل طلب الشراء PDF", "Download Purchase Order PDF")}
            </button>
            <button onClick={() => { setStep("search"); setSearchId(""); setSearched(false); }} className="px-6 py-3 rounded-xl border border-border hover:bg-secondary font-semibold">
              {t("تحويل عرض سعر آخر", "Convert Another Quotation")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir={isRtl ? "rtl" : "ltr"} style={{ fontFamily: isRtl ? "Cairo, sans-serif" : "Inter, sans-serif" }} className="bg-background min-h-screen">
      {/* Hero */}
      
      <div style={{ background: "linear-gradient(135deg, #0A1628 0%, #0D1E40 60%, #1E3A6E 100%)", padding: "60px 24px" }} className="text-white text-center">
        <div style={{ fontSize: "52px", marginBottom: "16px" }}>📋</div>
        <h1 style={{ fontSize: "clamp(22px, 4vw, 34px)", fontWeight: 900, marginBottom: "10px" }}>
          {t("طلب شراء من عرض سعر", "Purchase Order from Quotation")}
        </h1>
        <p style={{ opacity: 0.75, fontSize: "16px", maxWidth: "500px", margin: "0 auto" }}>
          {t("أدخل رقم عرض السعر لتحويله إلى طلب شراء واستكمال إجراءات الدفع والتوصيل", "Enter your quotation number to convert it to a purchase order and complete payment and delivery")}
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {step === "search" && (
          <>
            {/* Search box */}
            <div className="bg-white rounded-3xl shadow-sm border border-border p-8 mb-6">
              <h3 style={{ fontWeight: 800, fontSize: "18px", color: "var(--primary)", marginBottom: "20px" }}>
                {t("أدخل رقم عرض السعر", "Enter Quotation Number")}
              </h3>
              <div className="flex gap-3">
                <input
                  value={searchId}
                  onChange={e => setSearchId(e.target.value)}
                  placeholder="QUT-..."
                  className="flex-1 field-input"
                  onKeyDown={e => { if (e.key === "Enter") setSearched(true); }}
                />
                <button
                  onClick={() => setSearched(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #0D1E40, #1E3A6E)" }}
                >
                  <Search size={18} /> {t("بحث", "Search")}
                </button>
              </div>
            </div>
            

            {searched && !foundQuotation && (
              <div className="bg-white rounded-3xl border border-border p-10 text-center">
                <FileText size={60} className="mx-auto mb-4 text-muted-foreground opacity-30" />
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--foreground)", marginBottom: "8px" }}>
                  {t("لم يتم العثور على عرض السعر", "Quotation Not Found")}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t("تأكد من رقم عرض السعر وحاول مرة أخرى", "Please verify the quotation number and try again")}
                </p>
              </div>
            )}

            {searched && foundQuotation && (
              <div className="bg-white rounded-3xl shadow-sm border border-border overflow-hidden">
                <div style={{ background: "linear-gradient(135deg, #0D1E40, #1E3A6E)" }} className="px-6 py-4 text-white flex items-center justify-between">
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "18px" }}>{foundQuotation.id}</div>
                    <div style={{ opacity: 0.75, fontSize: "14px" }}>{new Date(foundQuotation.createdAt).toLocaleDateString(isRtl ? "ar" : "en")}</div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: "rgba(196,154,32,0.3)", color: "#F0C040" }}>
                    {t("عرض سعر", "Quotation")}
                  </span>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-5 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="text-muted-foreground">{t("العميل", "Customer")}</div>
                      <div style={{ fontWeight: 700 }}>{foundQuotation.customerName}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-muted-foreground">{t("الهاتف", "Phone")}</div>
                      <div style={{ fontWeight: 700 }}>{foundQuotation.customerPhone}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-muted-foreground">{t("صالح لمدة", "Valid for")}</div>
                      <div style={{ fontWeight: 700 }}>{foundQuotation.quotationValidity} {t("يوم", "days")}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-muted-foreground">{t("الإجمالي", "Total")}</div>
                      <div style={{ fontWeight: 800, fontSize: "18px", color: "var(--primary)" }}>{currency}{foundQuotation.total.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="mb-5">
                    <div style={{ fontWeight: 700, color: "var(--primary)", marginBottom: "10px" }}>{t("الأصناف", "Items")}</div>
                    {foundQuotation.items.map(item => (
                      <div key={item.product.id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                        <img src={item.product.image} alt="" className="w-10 h-10 rounded-xl object-cover" />
                        <div className="flex-1 text-sm">
                          <div style={{ fontWeight: 600 }}>{isRtl ? item.product.nameAr : item.product.nameEn}</div>
                          <div className="text-muted-foreground">× {item.quantity}</div>
                        </div>
                        <div style={{ fontWeight: 700, color: "var(--accent)" }}>{currency}{(item.product.price * item.quantity).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={startCheckout}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-bold text-lg transition-all hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #C49A20, #D4A820)" }}
                  >
                    <ShoppingCart size={20} />
                    {t("تحويل إلى طلب شراء", "Convert to Purchase Order")}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {step === "checkout" && foundQuotation && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-border p-6">
              <h3 style={{ fontWeight: 800, fontSize: "18px", color: "var(--primary)", marginBottom: "18px" }}>
                {t("بيانات العميل", "Customer Details")}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-sm font-semibold">{t("الاسم *", "Name *")}</label>
                  <input required value={customerName} onChange={e => setCustomerName(e.target.value)} className="field-input" />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-semibold">{t("الهاتف *", "Phone *")}</label>
                  <input required value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="field-input" />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1.5 text-sm font-semibold">{t("البريد الإلكتروني", "Email")}</label>
                  <div className="relative">
                    <Mail size={16} className="absolute top-1/2 -translate-y-1/2 text-muted-foreground" style={{ [isRtl ? "right" : "left"]: "14px" }} />
                    <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="field-input" placeholder={t("اختياري - سيُرسل رقم الطلب", "Optional - order ID will be sent here")} style={{ [isRtl ? "paddingRight" : "paddingLeft"]: "40px" }} />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1.5 text-sm font-semibold">{t("عنوان التوصيل *", "Delivery Address *")}</label>
                  <input required value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} className="field-input" />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-3xl shadow-sm border border-border p-6">
              <h3 style={{ fontWeight: 800, fontSize: "18px", color: "var(--primary)", marginBottom: "18px" }}>
                {t("طريقة الدفع", "Payment Method")}
              </h3>
              <div className="flex flex-wrap gap-3 mb-5">
                {[
                  { v: "cash", icon: <Banknote size={20} />, ar: "نقداً عند التسليم", en: "Cash on Delivery" },
                  { v: "bank_transfer", icon: <Building2 size={20} />, ar: "تحويل بنكي", en: "Bank Transfer" },
                ].map(opt => (
                  <button key={opt.v} type="button" onClick={() => setPaymentMethod(opt.v as any)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl border-2 font-bold transition-all ${paymentMethod === opt.v ? "border-primary text-white" : "border-border bg-white hover:border-primary/40"}`}
                    style={paymentMethod === opt.v ? { background: "linear-gradient(135deg, #0D1E40, #1E3A6E)" } : {}}>
                    {opt.icon} {isRtl ? opt.ar : opt.en}
                  </button>
                ))}
              </div>
              {paymentMethod === "bank_transfer" && (
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1.5 text-sm font-semibold">{t("اختر البنك *", "Select Bank *")}</label>
                    <select required value={selectedBank} onChange={e => setSelectedBank(e.target.value)} className="field-input">
                      <option value="">{t("-- اختر البنك --", "-- Select Bank --")}</option>
                      {activeBanks.map(b => <option key={b.id} value={b.id}>{isRtl ? b.nameAr : b.nameEn} — {b.accountNumber}</option>)}
                    </select>
                  </div>
                  {selectedBank && (
                    <div className="p-5 rounded-2xl border-2 border-primary/20" style={{ background: "linear-gradient(135deg, #f5f8ff, #edf1fb)" }}>
                      <div className="text-sm text-muted-foreground mb-1">{t("رقم الحساب", "Account Number")}</div>
                      <div style={{ fontFamily: "monospace", fontSize: "22px", fontWeight: 800, color: "var(--primary)", letterSpacing: "3px" }}>
                        {activeBanks.find(b => b.id === selectedBank)?.accountNumber}
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block mb-1.5 text-sm font-semibold">{t("الرقم المرجعي *", "Reference Number *")}</label>
                    <input required value={transferRef} onChange={e => setTransferRef(e.target.value)} className="field-input" placeholder={t("أدخل رقم العملية", "Enter transaction reference")} />
                  </div>
                </div>
              )}
            </div>

            {/* Order summary */}
            <div className="bg-white rounded-3xl shadow-sm border border-border p-6">
              <h3 style={{ fontWeight: 800, fontSize: "18px", color: "var(--primary)", marginBottom: "14px" }}>{t("ملخص الطلب", "Order Summary")}</h3>
              {foundQuotation.items.map(item => (
                <div key={item.product.id} className="flex justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm">{isRtl ? item.product.nameAr : item.product.nameEn} <span className="text-muted-foreground">× {item.quantity}</span></span>
                  <span style={{ fontWeight: 700 }}>{currency}{(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-4 mt-1">
                <span style={{ fontWeight: 800 }}>{t("الإجمالي", "Total")}</span>
                <span style={{ fontWeight: 900, fontSize: "22px", color: "var(--primary)" }}>{currency}{foundQuotation.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep("search")} className="flex-1 py-4 rounded-2xl border-2 border-border bg-white hover:bg-secondary font-bold">
                {t("رجوع", "Back")}
              </button>
              <button type="submit" className="flex-1 py-4 rounded-2xl text-white font-bold text-lg hover:opacity-90" style={{ background: "linear-gradient(135deg, #0D1E40, #1E3A6E)" }}>
                {t("تأكيد طلب الشراء", "Confirm Purchase Order")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
