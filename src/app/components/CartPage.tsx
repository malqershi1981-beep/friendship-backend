import { useState } from "react";
import { Trash2, ShoppingBag, FileText, CreditCard, Building2, Banknote, Mail, CheckCircle } from "lucide-react";
import { useApp } from "../context/AppContext";
import type { Order } from "../context/AppContext";
import { createOrder } from "../lib/api";
import { jsPDF } from "jspdf";
import { drawPdfText, drawPdfLabelValue } from "../lib/pdfUtils";
import heroImage from "../../imports/_______2.png";

export function CartPage() {
  const { lang, settings, t, cart, removeFromCart, updateCartQty, clearCart, cartTotal, banks, setCurrentPage, setOrders, currency } = useApp();
  const isRtl = lang === "ar";
  const [step, setStep] = useState<"cart" | "checkout" | "success">("cart");
  const [orderType, setOrderType] = useState<"quotation" | "purchase">("purchase");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerEmailError, setCustomerEmailError] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "bank_transfer">("cash");
  const [selectedBank, setSelectedBank] = useState("");
  const [transferRef, setTransferRef] = useState("");
  const [validity, setValidity] = useState(settings.quotationValidityDays);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const activeBanks = banks.filter(b => b.active);

  const mockSendEmail = (orderId: string, email: string) => {
    // Mock email sending — in production replace with real API call
    console.log(`[Mock Email] Sending order ID ${orderId} to ${email}`);
    setEmailSent(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // validate email if provided
    if (customerEmail && !isValidEmail(customerEmail)) {
      setCustomerEmailError(isRtl ? "أدخل بريدًا إلكترونيًا صالحًا" : "Please enter a valid email address");
      return;
    }
    setCustomerEmailError("");
    const status: "pending" | "closed" = orderType === "quotation" ? "pending" : "pending";
    const payload = {
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      items: cart.map(item => ({ product: item.product, quantity: item.quantity, price: item.product.price })),
      total: cartTotal,
      paymentMethod,
      bankId: paymentMethod === "bank_transfer" ? selectedBank : undefined,
      transferRef: paymentMethod === "bank_transfer" ? transferRef : undefined,
      status,
      isQuotation: orderType === "quotation",
      quotationValidity: orderType === "quotation" ? validity : null,
    };

    try {
      const created = await createOrder(payload);
      setOrders(prev => [...prev, created]);
      setCreatedOrder(created);
      clearCart();
      if (customerEmail) mockSendEmail(created.id, customerEmail);
      setStep("success");
    } catch (error) {
      console.error("Failed to submit order:", error);
      alert(isRtl ? "فشل إرسال الطلب، حاول مرة أخرى." : "Failed to submit order, please try again.");
    }
  };

  function isValidEmail(email: string) {
    // simple, permissive email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function tryFillEmailFromDevice() {
    try {
      if (!(navigator as any).credentials) return;
      const cred = await (navigator as any).credentials.get?.({ password: true, mediation: 'optional' });
      const id = cred && cred.id ? String(cred.id) : null;
      if (id && isValidEmail(id)) {
        setCustomerEmail(id);
        setCustomerEmailError("");
      }
    } catch (err) {
      console.debug("Autofill email failed:", err);
    }
  }

  const downloadQuotationPDF = () => {
    if (!createdOrder) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const width = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const right = width - margin;
    const logoSize = 64;
    const headerSectionHeight = 136;
    const whitePanelTop = 108;
    const whitePanelHeight = 48;
    const orderTitle = createdOrder.isQuotation ? t("عرض سعر", "Quotation") : t("طلب شراء", "Purchase Order");
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
    const daysLabel = t("يوم", "days");
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

    const logoX = isRtl ? margin + 16 : right - logoSize - 16;
    const logoY = whitePanelTop - logoSize / 2 + 6;
    const logoCenterX = logoX + logoSize / 2;
    const logoCenterY = logoY + logoSize / 2;

    doc.setFillColor(13, 30, 64);
    doc.rect(0, 0, width, headerSectionHeight, "F");

    doc.setFillColor(255, 255, 255);
    doc.rect(margin, whitePanelTop, right - margin, whitePanelHeight, "F");

    doc.setFont("helvetica", "bold").setFontSize(18);
    drawPdfText(doc, orderTitle, headerX, 32, { align: headerAlign, fontSize: 18, dir: isRtl ? "rtl" : "ltr", color: "#FFFFFF" });
    if (isRtl) {
      drawPdfLabelValue(doc, orderLabel, createdOrder.id, headerX, 56, {
        fontSize: 13,
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
    drawPdfText(doc, t("الصداقة للتجاره", "FriendShip Trading"), width / 2, whitePanelTop + 12, {
      align: "center",
      fontSize: 16,
      color: "#000000",
      dir: isRtl ? "rtl" : "ltr",
      maxWidth: right - margin - logoSize - 24,
    });
    doc.setFont("helvetica", "normal").setFontSize(11);
    drawPdfText(doc, t("الوكالات العامة", "General Agencies"), width / 2, whitePanelTop + 30, {
      align: "center",
      fontSize: 11,
      color: "#000000",
      dir: isRtl ? "rtl" : "ltr",
      maxWidth: right - margin - logoSize - 24,
    });

    // try to draw the project logo image (preferred) — fallback to a simple circle badge
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
    if (createdOrder.deliveryAddress) {
      detailY += 4;
      detailY += drawPdfLabelValue(doc, addressLabel, createdOrder.deliveryAddress, detailX, detailY, {
        fontSize: 11,
        labelDir: isRtl ? "rtl" : "ltr",
        valueDir: isRtl ? "rtl" : "ltr",
        anchor: isRtl ? "right" : "left",
        rightBound: right,
        maxWidth: right - margin,
      });
    }
    if (createdOrder.isQuotation && createdOrder.quotationValidity != null) {
      detailY += 4;
      detailY += drawPdfText(doc, `${t("صالح لمدة", "Valid for")} ${createdOrder.quotationValidity} ${daysLabel}`, detailX, detailY, {
        align: detailAlign,
        fontSize: 11,
        dir: isRtl ? "rtl" : "ltr",
        maxWidth: right - margin,
      });
    }

    const tableTop = detailY + 30;
    doc.setFillColor(240, 241, 244);
    doc.rect(margin, tableTop - 16, right - margin, 24, "F");
    doc.setFont("helvetica", "bold").setTextColor(0).setFontSize(11);
    const itemColumnWidth = 260;
    const itemColumnRight = margin + itemColumnWidth - 2;
    const itemLabelX = isRtl ? itemColumnRight : margin + 2;
    const itemLabelAlign: CanvasTextAlign = isRtl ? "right" : "left";
    const headerTextY = isRtl ? tableTop - 2 : tableTop;
    drawPdfText(doc, itemLabel, itemLabelX, headerTextY, {
      align: itemLabelAlign,
      fontSize: 11,
      dir: isRtl ? "rtl" : "ltr",
      maxWidth: itemColumnWidth,
    });
    drawPdfText(doc, qtyLabel, 360, headerTextY, { align: "center", fontSize: 11 });
    drawPdfText(doc, unitPriceLabel, 460, headerTextY, { align: "center", fontSize: 11 });
    drawPdfText(doc, totalLabel, right, headerTextY, { align: "right", fontSize: 11, dir: isRtl ? "rtl" : "ltr" });
    doc.setLineWidth(0.5);
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
      y += rowHeight + 10;
      if (y > doc.internal.pageSize.getHeight() - 80) {
        doc.addPage();
        y = margin;
      }
    });
    doc.setLineWidth(0.5);
    doc.line(margin, y, right, y);
    y += 18;
    doc.setFont("helvetica", "bold").setFontSize(13);
    drawPdfText(doc, totalDueLabel, 460, y, { align: "center", fontSize: 13, dir: isRtl ? "rtl" : "ltr" });
    drawPdfText(doc, formatCurrency(createdOrder.total), right, y, { align: "right", fontSize: 13 });


    if (!createdOrder.isQuotation) {
      y += 22;
      doc.setFont("helvetica", "normal").setFontSize(10);
      const paymentMethodLabel = createdOrder.paymentMethod === "bank_transfer"
        ? t("تحويل بنكي", "Bank Transfer")
        : t("نقداً عند التسليم", "Cash on Delivery");
      drawPdfText(doc, `${t("طريقة الدفع:", "Payment Method:")} ${paymentMethodLabel}`, detailX, y, {
        align: detailAlign,
        fontSize: 10,
        dir: isRtl ? "rtl" : "ltr",
        maxWidth: right - margin,
      });
    }

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

    doc.save(`${createdOrder.isQuotation ? "quotation" : "purchase-order"}-${createdOrder.id}.pdf`);
  };

  if (step === "success" && createdOrder) {
    return (
      <div dir={isRtl ? "rtl" : "ltr"} style={{ fontFamily: isRtl ? "Cairo, sans-serif" : "Inter, sans-serif" }} className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl border border-border p-10 max-w-lg w-full text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "linear-gradient(135deg, #0D1E40, #1E3A6E)" }}>
            <CheckCircle size={40} className="text-white" />
          </div>
          <h2 style={{ fontSize: "26px", fontWeight: 800, color: "var(--primary)", marginBottom: "10px" }}>
            {createdOrder.isQuotation ? t("تم إنشاء عرض السعر", "Quotation Created") : t("تم إرسال طلبك", "Order Submitted")}
          </h2>
          <div className="inline-block px-5 py-2 rounded-full bg-primary/8 border border-primary/20 mb-3">
            <span className="text-muted-foreground text-sm">{t("رقم الطلب:", "Order ID:")}</span>{" "}
            <strong className="text-primary" style={{ fontSize: "16px" }}>{createdOrder.id}</strong>
          </div>
          {createdOrder.isQuotation && (
            <p className="text-muted-foreground mb-2 text-sm">
              {t(`صالح لمدة ${createdOrder.quotationValidity} يوم`, `Valid for ${createdOrder.quotationValidity} days`)}
            </p>
          )}
          {emailSent && createdOrder.customerEmail && (
            <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-green-50 border border-green-200 text-green-700 mb-5 text-sm font-semibold">
              <Mail size={16} />
              {t(`تم إرسال رقم الطلب على ${createdOrder.customerEmail}`, `Order ID sent to ${createdOrder.customerEmail}`)}
            </div>
          )}
          <div className="flex flex-col gap-3 mt-6">
            <button onClick={downloadQuotationPDF} className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-bold hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg, #0D1E40, #1E3A6E)" }}>
              <FileText size={18} />
              {t("تنزيل PDF", "Download PDF")}
            </button>
            {!createdOrder.isQuotation && (
              <button onClick={() => setCurrentPage("track")} className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-colors">
                {t("تتبع الطلب", "Track Order")}
              </button>
            )}
            <button onClick={() => { setCurrentPage("home"); setStep("cart"); }} className="px-6 py-3 rounded-xl border border-border hover:bg-secondary transition-colors font-semibold">
              {t("العودة للرئيسية", "Back to Home")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0 && step === "cart") {
    return (
      <div dir={isRtl ? "rtl" : "ltr"} style={{ fontFamily: isRtl ? "Cairo, sans-serif" : "Inter, sans-serif" }} className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <ShoppingBag size={80} className="mx-auto mb-6 text-muted-foreground opacity-30" />
          <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--foreground)", marginBottom: "8px" }}>
            {t("سلتك فارغة", "Your cart is empty")}
          </h2>
          <p className="text-muted-foreground mb-8">{t("أضف بعض المنتجات للبدء", "Add some products to get started")}</p>
          <button onClick={() => setCurrentPage("home")} className="px-8 py-3.5 rounded-2xl text-white font-bold hover:opacity-90" style={{ background: "linear-gradient(135deg, #0D1E40, #1E3A6E)" }}>
            {t("تصفح المنتجات", "Browse Products")}
          </button>
        </div>
      </div>
    );
  }

  const BtnGrad = ({ children, onClick, type = "button", disabled = false, className = "" }: any) => (
    <button type={type} onClick={onClick} disabled={disabled} className={`px-6 py-3 rounded-xl text-white font-bold transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 ${className}`} style={{ background: "linear-gradient(135deg, #0D1E40, #1E3A6E)" }}>
      {children}
    </button>
  );

  return (
    <div dir={isRtl ? "rtl" : "ltr"} style={{ fontFamily: isRtl ? "Cairo, sans-serif" : "Inter, sans-serif" }} className="bg-background min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 style={{ fontSize: "32px", fontWeight: 900, color: "var(--primary)" }}>
            {step === "cart" ? t("سلة المشتريات", "Shopping Cart") : t("إتمام الطلب", "Checkout")}
          </h1>
        </div>

        {step === "cart" && (
          <>
            {/* Order type toggle */}
            <div className="flex gap-3 mb-6">
              {[
                { v: "purchase", icon: <CreditCard size={18} />, ar: "طلب شراء", en: "Purchase Order" },
                { v: "quotation", icon: <FileText size={18} />, ar: "طلب عرض سعر", en: "Request Quotation" },
              ].map(opt => (
                <button
                  key={opt.v}
                  onClick={() => setOrderType(opt.v as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl border-2 font-bold transition-all ${orderType === opt.v ? "border-primary text-white" : "border-border bg-white hover:border-primary/40 hover:-translate-y-0.5"}`}
                  style={orderType === opt.v ? { background: "linear-gradient(135deg, #0D1E40, #1E3A6E)" } : {}}
                >
                  {opt.icon} {isRtl ? opt.ar : opt.en}
                </button>
              ))}
            </div>

            {/* Cart items */}
            <div className="bg-white rounded-3xl shadow-sm border border-border overflow-hidden mb-6">
              {cart.map((item, idx) => (
                <div key={item.product.id} className={`flex items-center gap-4 p-4 ${idx < cart.length - 1 ? "border-b border-border" : ""}`}>
                  <img src={item.product.image} alt="" className="w-16 h-16 rounded-2xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div style={{ fontWeight: 700 }}>{isRtl ? item.product.nameAr : item.product.nameEn}</div>
                    <div style={{ fontWeight: 700, color: "var(--accent)" }}>{currency}{item.product.price.toFixed(2)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateCartQty(item.product.id, item.quantity - 1)} className="btn-icon w-8 h-8">−</button>
                    <span className="w-10 text-center font-bold">{item.quantity}</span>
                    <button onClick={() => updateCartQty(item.product.id, item.quantity + 1)} className="btn-icon w-8 h-8">+</button>
                  </div>
                  <div style={{ fontWeight: 800, color: "var(--primary)", minWidth: "80px", textAlign: isRtl ? "left" : "right" }}>
                    {currency}{(item.product.price * item.quantity).toFixed(2)}
                  </div>
                  <button onClick={() => removeFromCart(item.product.id)} className="btn-icon p-2 text-destructive hover:text-red-600">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            {/* Total & proceed */}
            <div className="flex items-center justify-between bg-white rounded-3xl shadow-sm border border-border p-6">
              <div>
                <div className="text-muted-foreground text-sm">{t("الإجمالي", "Total")}</div>
                <div style={{ fontSize: "32px", fontWeight: 900, color: "var(--primary)" }}>{currency}{cartTotal.toFixed(2)}</div>
              </div>
              <BtnGrad type="button" onClick={() => setStep("checkout")} className="px-10 py-4 text-lg">
                {orderType === "quotation" ? t("إنشاء عرض السعر", "Create Quotation") : t("متابعة الدفع", "Proceed to Checkout")}
              </BtnGrad>
            </div>
          </>
        )}

        {step === "checkout" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer info */}
            <div className="bg-white rounded-3xl shadow-sm border border-border p-6">
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--primary)", marginBottom: "18px" }}>
                {t("بيانات العميل", "Customer Details")}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label={t("الاسم أو اسم الشركة *", "Name / Company *")}>
                  <input required value={customerName} onChange={e => setCustomerName(e.target.value)} className="field-input" />
                </Field>
                <Field label={t("رقم الهاتف *", "Phone *")}>
                  <input  type="tel" required value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} pattern="[0-9]+" className="field-input" />
                </Field>
                <div className="md:col-span-2">
                  <Field label={t("البريد الإلكتروني", "Email Address")}>
                    <div className="relative">
                      <Mail size={16} className="absolute top-1/2 -translate-y-1/2 text-muted-foreground" style={{ [isRtl ? "right" : "left"]: "14px" }} />
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={e => { setCustomerEmail(e.target.value); setCustomerEmailError(""); }}
                        onBlur={() => { if (customerEmail && !isValidEmail(customerEmail)) setCustomerEmailError(isRtl ? "أدخل بريدًا إلكترونيًا صالحًا" : "Please enter a valid email address"); }}
                        autoComplete="email"
                        aria-invalid={!!customerEmailError}
                        placeholder={t("سيُرسل رقم الطلب على بريدك (اختياري)", "Order ID will be sent here (optional)")}
                        className="w-full py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                        style={{ [isRtl ? "paddingRight" : "paddingLeft"]: "40px", paddingLeft: isRtl ? "14px" : "40px", paddingRight: isRtl ? "40px" : "14px" }}
                      />
                      <button type="button" onClick={tryFillEmailFromDevice} className="absolute top-1/2 -translate-y-1/2 text-sm text-primary font-semibold" style={{ right: isRtl ? undefined : "12px", left: isRtl ? "12px" : undefined }}>
                        {t("ملء تلقائي", "Autofill")}
                      </button>
                      {customerEmailError && (
                        <div className="text-destructive text-sm mt-2">{customerEmailError}</div>
                      )}
                    </div>
                  </Field>
                </div>
                {orderType !== "quotation" && (
                  <div className="md:col-span-2">
                    <Field label={t("عنوان التوصيل *", "Delivery Address *")}>
                      <input required value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} className="field-input" />
                    </Field>
                  </div>
                )}
                {orderType === "quotation" && (
                <Field label={t("فترة الصلاحية (أيام)", "Validity (days)")}>
                <input
                 type="number"
                 value={settings.quotationValidityDays}
                readOnly
                className="field-input bg-gray-100 cursor-not-allowed"
                />
                </Field>
            )}
            </div>
            </div>

            {/* Payment */}
            {orderType !== "quotation" && (
              <div className="bg-white rounded-3xl shadow-sm border border-border p-6">
                <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--primary)", marginBottom: "18px" }}>
                  {t("طريقة الدفع", "Payment Method")}
                </h3>
                <div className="flex flex-wrap gap-3 mb-6">
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
                    <Field label={t("اختر البنك *", "Select Bank *")}>
                      <select required value={selectedBank} onChange={e => setSelectedBank(e.target.value)} className="field-input">
                        <option value="">{t("-- اختر البنك --", "-- Select Bank --")}</option>
                        {activeBanks.map(b => <option key={b.id} value={b.id}>{isRtl ? b.nameAr : b.nameEn} — {b.accountNumber}</option>)}
                      </select>
                    </Field>
                    {selectedBank && (
                      <div className="p-5 rounded-2xl border-2 border-primary/20" style={{ background: "linear-gradient(135deg, #f5f8ff, #edf1fb)" }}>
                        <div className="text-sm text-muted-foreground mb-1">{t("رقم الحساب البنكي", "Bank Account Number")}</div>
                        <div style={{ fontFamily: "monospace", fontSize: "22px", fontWeight: 800, color: "var(--primary)", letterSpacing: "3px" }}>
                          {activeBanks.find(b => b.id === selectedBank)?.accountNumber}
                        </div>
                      </div>
                    )}
                    <Field label={t("الرقم المرجعي للتحويل *", "Transfer Reference *")}>
                      <input required value={transferRef} onChange={e => setTransferRef(e.target.value)} className="field-input" placeholder={t("أدخل رقم العملية", "Enter transaction reference")} />
                    </Field>
                  </div>
                )}
              </div>
            )}

            {/* Summary */}
            <div className="bg-white rounded-3xl shadow-sm border border-border p-6">
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--primary)", marginBottom: "16px" }}>{t("ملخص الطلب", "Order Summary")}</h3>
              {cart.map(item => (
                <div key={item.product.id} className="flex justify-between py-2.5 border-b border-border last:border-0">
                  <span>{isRtl ? item.product.nameAr : item.product.nameEn} <span className="text-muted-foreground">× {item.quantity}</span></span>
                  <span style={{ fontWeight: 700 }}>{currency}{(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-4 mt-1">
                <span style={{ fontWeight: 800, fontSize: "18px" }}>{t("الإجمالي", "Total")}</span>
                <span style={{ fontWeight: 900, fontSize: "24px", color: "var(--primary)" }}>{currency}{cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep("cart")} className="btn-outline flex-1 py-4 rounded-2xl border-2 border-border bg-white hover:bg-secondary font-bold transition-colors">
                {t("رجوع", "Back")}
              </button>
              <button type="submit" className="btn-primary flex-1 py-4 rounded-2xl text-white font-bold text-lg transition-all hover:opacity-90">
                {orderType === "quotation" ? t("إنشاء عرض السعر", "Create Quotation") : t("تأكيد الطلب", "Confirm Order")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block mb-1.5" style={{ fontSize: "14px", fontWeight: 600 }}>{label}</label>
      {children}
    </div>
  );
}

// Inject shared input class via a style tag workaround — just reuse inline
declare global { interface HTMLElementTagNameMap { } }
