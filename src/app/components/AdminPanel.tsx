import React, { useState, useRef } from "react";
import  SettingsAdmin  from "./SettingsAdmin";

import {
  Package, Building2, Truck, Users, BarChart2, Star, Plus, Edit2, Trash2,
  CheckCircle, XCircle, Eye, EyeOff, TrendingUp, DollarSign, MessageSquare, LayoutGrid
} from "lucide-react";
import { useApp } from "../context/AppContext";
import {
  createCategory, updateCategory, deleteCategory,
  createProduct, updateProduct, deleteProduct,
  createBank, updateBank, deleteBank,
  createEmployee, updateEmployee, deleteEmployee,
  createStaffUser, updateStaffUser, deleteStaffUser,
  updateReview,
  updateOrder
} from "../lib/api";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "./ui/table";
import type { Product, Bank, DeliveryEmployee, StaffUser, Category, Order, OrderStatus } from "../context/AppContext";

type AdminTab = "categories" | "products" | "banks" | "employees" | "staff" | "orders" | "revenue" | "reviews" | "settings";

export function AdminPanel() {
  const { lang, settings, setSettings, t, categories, setCategories, products, setProducts, banks, setBanks, employees, setEmployees, staff, setStaff, orders, setOrders, reviews, setReviews } = useApp();
  const isRtl = lang === "ar";
  const [tab, setTab] = useState<AdminTab>("products");

  const tabs: { key: AdminTab; ar: string; en: string; icon: React.ReactNode }[] = [
    { key: "categories", ar: "الأقسام", en: "Categories", icon: <LayoutGrid size={17} /> },
    { key: "products", ar: "الأصناف", en: "Products", icon: <Package size={17} /> },
    { key: "orders", ar: "الطلبات", en: "Orders", icon: <LayoutGrid size={17} /> },
    { key: "banks", ar: "البنوك", en: "Banks", icon: <Building2 size={17} /> },
    { key: "employees", ar: "موظفو التوصيل", en: "Delivery Staff", icon: <Truck size={17} /> },
    { key: "staff", ar: "المستخدمون", en: "Staff Users", icon: <Users size={17} /> },
    { key: "revenue", ar: "الإيرادات", en: "Revenue", icon: <BarChart2 size={17} /> },
    { key: "reviews", ar: "التقييمات", en: "Reviews", icon: <Star size={17} /> },
    { key: "settings", ar: "الإعدادات", en: "Settings", icon: <Edit2 size={17} /> },
  ];

  return (
    <div dir={isRtl ? "rtl" : "ltr"} style={{ fontFamily: isRtl ? "Cairo, sans-serif" : "Inter, sans-serif" }} className="flex h-full flex-col md:flex-row">
      {/* Sidebar - becomes top bar on small screens */}
      <div className="md:w-52 w-full flex-shrink-0 flex md:flex-col flex-row md:py-4 py-2 gap-1 px-3 overflow-x-auto md:overflow-y-auto" style={{ background: "linear-gradient(180deg, #0A1628 0%, #0D1E40 100%)" }}>
        {tabs.map(tb => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={`flex items-center gap-3 px-3 md:px-4 py-2 md:py-2.5 rounded-xl transition-all text-sm text-white ${tab === tb.key ? "font-bold" : "opacity-65 hover:opacity-90 hover:bg-white/10"}`}
            style={tab === tb.key ? { background: "linear-gradient(135deg, rgba(196,154,32,0.3), rgba(196,154,32,0.15))", border: "1px solid rgba(196,154,32,0.4)" } : {}}
          >
            <span className={tab === tb.key ? "text-yellow-400" : ""}>{tb.icon}</span>
            <span className="whitespace-nowrap ml-1">{isRtl ? tb.ar : tb.en}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-background">
        {tab === "categories" && <CategoriesAdmin categories={categories} setCategories={setCategories} products={products} lang={lang} t={t} isRtl={isRtl} />}
        {tab === "products" && <ProductsAdmin products={products} setProducts={setProducts} categories={categories} lang={lang} t={t} isRtl={isRtl} />}
        {tab === "orders" && <OrdersAdmin orders={orders} setOrders={setOrders} banks={banks} lang={lang} t={t} isRtl={isRtl} />}
        {tab === "banks" && <BanksAdmin banks={banks} setBanks={setBanks} lang={lang} t={t} isRtl={isRtl} />}
        {tab === "employees" && <EmployeesAdmin employees={employees} setEmployees={setEmployees} lang={lang} t={t} isRtl={isRtl} />}
        {tab === "staff" && <StaffAdmin staff={staff} setStaff={setStaff} lang={lang} t={t} isRtl={isRtl} />}
        {tab === "revenue" && <RevenueAdmin orders={orders} banks={banks} lang={lang} t={t} isRtl={isRtl} />}
        {tab === "reviews" && <ReviewsAdmin reviews={reviews} setReviews={setReviews} lang={lang} t={t} isRtl={isRtl} />}
        {tab === "settings" && <SettingsAdmin />}

      </div>
    </div>
  );
}

// ── Shared UI ────────────────────────────────────────────────────────
function SectionHeader({ title, onAdd, addLabel }: { title: string; onAdd: () => void; addLabel: string }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--primary)" }}>{title}</h2>
      <button onClick={onAdd} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold hover:opacity-90" style={{ background: "linear-gradient(135deg, #0D1E40, #1E3A6E)" }}>
        <Plus size={18} /> {addLabel}
      </button>
    </div>
  );
}
function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block mb-1.5" style={{ fontSize: "14px", fontWeight: 600 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} className="field-input" />
    </div>
  );
}
function FormBox({ children, onSave, onCancel, title }: { children: React.ReactNode; onSave: () => void; onCancel: () => void; title: string }) {
  return (
    <div className="bg-white rounded-2xl border-2 border-primary/15 p-6 mb-6 shadow-sm">
      <h3 style={{ fontWeight: 700, color: "var(--primary)", marginBottom: "16px" }}>{title}</h3>
      <div className="grid md:grid-cols-2 gap-4">{children}</div>
      <div className="flex gap-3 mt-5">
        <button onClick={onSave} className="px-7 py-2.5 rounded-xl text-white font-bold hover:opacity-90" style={{ background: "linear-gradient(135deg, #0D1E40, #1E3A6E)" }}>حفظ / Save</button>
        <button onClick={onCancel} className="px-7 py-2.5 rounded-xl border border-border hover:bg-secondary font-semibold">إلغاء / Cancel</button>
      </div>
    </div>
  );
}

// ── Categories ────────────────────────────────────────────────────────
function CategoriesAdmin({ categories, setCategories, products, lang, t, isRtl }: any) {
  const blank = { nameAr: "", nameEn: "", icon: "📦", descAr: "", descEn: "" };
  const [form, setForm] = useState(blank);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const emojiOptions = ["📝", "💻", "🏦", "📦", "🔧", "🎨", "📱", "🖨️", "🗂️", "📊", "🏪", "🛒"];

  const save = () => {
    (async () => {
      if (editId) {
        try {
          const updated = await updateCategory(editId, form);
          setCategories((prev: Category[]) => prev.map((c: Category) => c.id === editId ? updated : c));
        } catch (err) {
          console.error(err);
          alert("Failed to update category");
          return;
        }
      } else {
        try {
          const created = await createCategory(form);
          setCategories((prev: Category[]) => [...prev, created]);
        } catch (err) {
          console.error(err);
          alert("Failed to create category");
          return;
        }
      }
      setEditId(null);
      setForm(blank); setShowForm(false);
    })();
  };

  const del = (id: string) => {
    const used = products.some((p: any) => p.category === id);
    if (used) { alert(isRtl ? "لا يمكن حذف قسم يحتوي على منتجات" : "Cannot delete a category that contains products"); return; }
    (async () => {
      if (!confirm(isRtl ? "هل تريد حذف هذا القسم؟" : "Delete this category?")) return;
      try {
        await deleteCategory(id);
        setCategories((prev: Category[]) => prev.filter((c: Category) => c.id !== id));
      } catch (err) {
        console.error(err);
        alert(isRtl ? "فشل حذف القسم" : "Failed to delete category");
      }
    })();
  };

  const edit = (c: Category) => { setForm({ nameAr: c.nameAr, nameEn: c.nameEn, icon: c.icon, descAr: c.descAr, descEn: c.descEn }); setEditId(c.id); setShowForm(true); };

  return (
    <div className="max-w-3xl">
      <SectionHeader title={t("إدارة الأقسام", "Manage Categories")} onAdd={() => { setShowForm(true); setEditId(null); setForm(blank); }} addLabel={t("قسم جديد", "New Category")} />

      {showForm && (
        <FormBox title={editId ? t("تعديل القسم", "Edit Category") : t("قسم جديد", "New Category")} onSave={save} onCancel={() => { setShowForm(false); setEditId(null); }}>
          <Input label={t("الاسم بالعربية", "Arabic Name")} value={form.nameAr} onChange={v => setForm(f => ({ ...f, nameAr: v }))} />
          <Input label={t("الاسم بالإنجليزية", "English Name")} value={form.nameEn} onChange={v => setForm(f => ({ ...f, nameEn: v }))} />
          <Input label={t("الوصف بالعربية", "Arabic Description")} value={form.descAr} onChange={v => setForm(f => ({ ...f, descAr: v }))} />
          <Input label={t("الوصف بالإنجليزية", "English Description")} value={form.descEn} onChange={v => setForm(f => ({ ...f, descEn: v }))} />
          <div className="md:col-span-2">
            <label className="block mb-2" style={{ fontSize: "14px", fontWeight: 600 }}>{t("الأيقونة", "Icon")}</label>
            <div className="flex flex-wrap gap-2">
              {emojiOptions.map(emoji => (
                <button key={emoji} type="button" onClick={() => setForm(f => ({ ...f, icon: emoji }))}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${form.icon === emoji ? "ring-2 ring-primary scale-110 bg-primary/10" : "bg-secondary hover:bg-primary/10"}`}>
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </FormBox>
      )}

      <div className="overflow-x-auto rounded-3xl bg-white border border-border shadow-sm">
        <Table className="min-w-full">
          <TableHeader className="bg-secondary">
            <TableRow>
              {[
                t("القسم", "Category"),
                t("الوصف", "Description"),
                t("الرمز", "Icon"),
                t("عدد المنتجات", "Product Count"),
                t("إجراءات", "Actions"),
              ].map((heading, index) => (
                <TableHead key={index} className="px-4 py-3" style={{ textAlign: isRtl ? "right" : "left" }}>{heading}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((c: Category) => {
              const productCount = products.filter((p: any) => p.category === c.id).length;
              return (
                <TableRow key={c.id} className="border-t border-border hover:bg-secondary/50">
                  <TableCell className="px-4 py-3 font-semibold">{isRtl ? c.nameAr : c.nameEn}</TableCell>
                  <TableCell className="px-4 py-3 text-muted-foreground">{isRtl ? c.descAr : c.descEn}</TableCell>
                  <TableCell className="px-4 py-3 text-lg">{c.icon}</TableCell>
                  <TableCell className="px-4 py-3 font-semibold text-primary">{productCount}</TableCell>
                  <TableCell className="px-4 py-3 flex gap-2">
                    <button onClick={() => edit(c)} className="px-3 py-2 rounded-xl bg-secondary hover:bg-primary/10 transition-colors text-primary"><Edit2 size={16} /></button>
                    <button onClick={() => del(c.id)} className="px-3 py-2 rounded-xl bg-secondary hover:bg-red-50 transition-colors text-destructive"><Trash2 size={16} /></button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <TableCaption className="p-4 text-muted-foreground">
          {t("إدارة الأقسام مع عدد المنتجات المرتبطة بكل قسم.", "Manage categories with the number of products linked to each.")}
        </TableCaption>
      </div>
    </div>
  );
}

// ── Products ─────────────────────────────────────────────────────────
function ProductsAdmin({ products, setProducts, categories, lang, t, isRtl }: any) {
  const blank: Omit<Product, "id"> = { nameAr: "", nameEn: "", descAr: "", descEn: "", price: 0, category: categories[0]?.id || "stationery", image: "", stock: 0, available: true };
  const [form, setForm] = useState<Omit<Product, "id">>(blank);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const openFilePicker = () => fileInputRef.current?.click();
  const handleImageFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setImageError(isRtl ? "اختر ملف صورة صالحاً" : "Please select a valid image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setForm(f => ({ ...f, image: reader.result as string }));
        setImageError("");
      }
    };
    reader.readAsDataURL(file);
  };

  const save = () => {
    (async () => {
      if (editId) {
        try {
          const updated = await updateProduct(editId, form);
          setProducts((prev: Product[]) => prev.map((p: Product) => p.id === editId ? updated : p as Product));
        } catch (err) {
          console.error(err);
          alert("Failed to update product");
          return;
        }
      } else {
        try {
          const created = await createProduct(form);
          setProducts((prev: Product[]) => [...prev, created]);
        } catch (err) {
          console.error(err);
          alert("Failed to create product");
          return;
        }
      }
      setEditId(null); setForm({ ...blank, category: categories[0]?.id || "stationery" }); setShowForm(false);
    })();
  };

  const del = (id: string) => {
    (async () => {
      if (!confirm(isRtl ? "هل تريد حذف هذا الصنف؟" : "Delete this product?")) return;
      try {
        await deleteProduct(id);
        setProducts((prev: Product[]) => prev.filter((p: Product) => p.id !== id));
      } catch (err) {
        console.error(err);
        alert(isRtl ? "فشل حذف الصنف" : "Failed to delete product");
      }
    })();
  };
  const edit = (p: Product) => { setForm({ nameAr: p.nameAr, nameEn: p.nameEn, descAr: p.descAr, descEn: p.descEn, price: p.price, category: p.category, image: p.image, stock: p.stock, available: p.available }); setEditId(p.id); setShowForm(true); };

  return (
    <div className="max-w-4xl">
      <SectionHeader title={t("إدارة الأصناف", "Manage Products")} onAdd={() => { setShowForm(true); setEditId(null); setForm({ ...blank, category: categories[0]?.id || "" }); }} addLabel={t("إضافة صنف", "Add Product")} />

      {showForm && (
        <FormBox title={editId ? t("تعديل الصنف", "Edit Product") : t("صنف جديد", "New Product")} onSave={save} onCancel={() => { setShowForm(false); setEditId(null); }}>
          <Input label={t("الاسم بالعربية", "Arabic Name")} value={form.nameAr} onChange={v => setForm(f => ({ ...f, nameAr: v }))} />
          <Input label={t("الاسم بالإنجليزية", "English Name")} value={form.nameEn} onChange={v => setForm(f => ({ ...f, nameEn: v }))} />
          <Input label={t("الوصف بالعربية", "Arabic Description")} value={form.descAr} onChange={v => setForm(f => ({ ...f, descAr: v }))} />
          <Input label={t("الوصف بالإنجليزية", "English Description")} value={form.descEn} onChange={v => setForm(f => ({ ...f, descEn: v }))} />
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
          <Input label={t("السعر ($)", "Price ($)")} type="number" value={String(form.price)} onChange={v => setForm(f => ({ ...f, price: parseFloat(v) || 0 }))} />
          <Input label={t("الكمية المتاحة", "Stock")} type="number" value={String(form.stock)} onChange={v => setForm(f => ({ ...f, stock: parseInt(v) || 0 }))} />
          <div className="md:col-span-2 space-y-3">
            <Input label={t("رابط الصورة", "Image URL")} value={form.image} onChange={v => setForm(f => ({ ...f, image: v }))} />
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={openFilePicker} className="px-4 py-2 rounded-xl border border-border bg-secondary hover:bg-secondary/90 text-sm">
                {t("اختر صورة من الجهاز", "Choose image from device")}
              </button>
              {imageError && <span className="text-xs text-destructive">{imageError}</span>}
            </div>
            {form.image && (
              <div className="flex flex-wrap items-center gap-3">
                <img src={form.image} alt={t("معاينة الصورة", "Image preview")} className="w-24 h-24 rounded-xl object-cover border border-border" />
                <span className="text-xs text-muted-foreground">{t("هذه الصورة ستُحفَظ في قاعدة البيانات لحقل image.", "This image will be saved in the product.image database field.")}</span>
              </div>
            )}
          </div>
          <div>
            <label className="block mb-1.5" style={{ fontSize: "14px", fontWeight: 600 }}>{t("القسم", "Category")}</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="field-input">
              {categories.map((c: Category) => <option key={c.id} value={c.id}>{isRtl ? c.nameAr : c.nameEn}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3 pt-6">
            <label style={{ fontWeight: 600, fontSize: "14px" }}>{t("متاح للعرض", "Available")}</label>
            <button type="button" onClick={() => setForm(f => ({ ...f, available: !f.available }))} className={`w-12 h-6 rounded-full transition-colors ${form.available ? "bg-green-500" : "bg-gray-300"} flex items-center px-0.5`}>
              <span className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${form.available ? "translate-x-6" : "translate-x-0"}`} />
            </button>
          </div>
        </FormBox>
      )}

      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex-1">
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--primary)" }}>{t("قائمة الأصناف", "Products List")}</h3>
          <div className="text-muted-foreground text-sm">{t("عرض وإدارة منتجاتك حسب القسم", "View and manage your products by category")}</div>
        </div>
        <div style={{ minWidth: 220 }}>
          <label className="block mb-2 text-sm font-semibold">{t("التصفية حسب القسم", "Filter by category")}</label>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="field-input w-full">
            <option value="all">{t("الكل", "All")}</option>
            {categories.map((c: Category) => <option key={c.id} value={c.id}>{isRtl ? c.nameAr : c.nameEn}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {(categoryFilter === "all" ? products : products.filter((p: Product) => p.category === categoryFilter)).map((p: Product) => {
          const cat = categories.find((c: Category) => c.id === p.category);
          return (
            <div key={p.id} className="bg-white rounded-2xl border border-border p-4 flex items-center gap-4">
              <img src={p.image || "https://images.unsplash.com/photo-1568667256549-094345857637?w=80&h=80&fit=crop"} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div style={{ fontWeight: 700 }}>{isRtl ? p.nameAr : p.nameEn}</div>
                <div className="text-muted-foreground text-sm flex items-center gap-2">
                  <span>{cat?.icon}</span>
                  <span>{isRtl ? cat?.nameAr : cat?.nameEn}</span>
                  <span>·</span>
                  <span className="font-semibold text-primary">${p.price.toFixed(2)}</span>
                  <span>·</span>
                  <span>{t("مخزون:", "Stock:")} {p.stock}</span>
                </div>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${p.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {p.available ? t("متاح", "Available") : t("غير متاح", "Unavailable")}
              </span>
              <div className="flex gap-2">
                <button onClick={() => edit(p)} className="p-2 rounded-xl hover:bg-secondary text-primary"><Edit2 size={16} /></button>
                <button onClick={() => del(p.id)} className="p-2 rounded-xl hover:bg-red-50 text-destructive"><Trash2 size={16} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Orders ───────────────────────────────────────────────────────────
function OrdersAdmin({ orders, setOrders, banks, lang, t, isRtl }: { orders: Order[]; setOrders: React.Dispatch<React.SetStateAction<Order[]>>; banks: Bank[]; lang: string; t: (ar: string, en: string) => string; isRtl: boolean }) {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "quotation" | "purchase">("all");
  const [searchId, setSearchId] = useState("");

  const statusMap: Record<OrderStatus, { ar: string; en: string }> = {
    pending: { ar: "قيد الانتظار", en: "Pending" },
    customer_service: { ar: "خدمة العملاء", en: "Customer Service" },
    payment_pending: { ar: "دفع معلق", en: "Payment Pending" },
    warehouse: { ar: "في المخزن", en: "Warehouse" },
    ready: { ar: "جاهز للتسليم", en: "Ready" },
    delivering: { ar: "في الطريق", en: "Delivering" },
    delivered: { ar: "تم التسليم", en: "Delivered" },
    rejected: { ar: "مرفوض", en: "Rejected" },
    closed: { ar: "مغلق", en: "Closed" },
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesType = typeFilter === "all" || (typeFilter === "quotation" ? !!order.isQuotation : !order.isQuotation);
    const matchesSearch = !searchId || order.id.toLowerCase().includes(searchId.toLowerCase()) || order.customerName.toLowerCase().includes(searchId.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const statusSequence: OrderStatus[] = ["pending", "customer_service", "warehouse", "ready", "delivering", "delivered", "closed"];
  const updateStatus = (orderId: string, currentStatus: OrderStatus) => {
    (async () => {
      const nextIndex = statusSequence.indexOf(currentStatus) + 1;
      if (nextIndex >= statusSequence.length) return;
      const nextStatus = statusSequence[nextIndex];
      try {
        const updated = await updateOrder(orderId, { status: nextStatus } as any);
        setOrders((prev) => prev.map((o) => o.id === orderId ? updated : o));
      } catch (err) {
        console.error(err);
        alert(isRtl ? "فشل تحديث حالة الطلب" : "Failed to update order status");
      }
    })();
  };

  return (
    <div className="max-w-7xl">
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--primary)" }}>{t("إدارة الطلبات", "Manage Orders")}</h2>
          <p className="text-muted-foreground text-sm mt-1">{t("افحص الطلبات الحالية وحدّث حالاتها من لوحة المسؤول.", "Review current orders and update their status from the admin panel.")}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="block mb-2 text-sm font-semibold">{t("نوع الطلب", "Order Type")}</label>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} className="field-input w-full">
              <option value="all">{t("الكل", "All")}</option>
              <option value="purchase">{t("طلب شراء", "Purchase")}</option>
              <option value="quotation">{t("عرض سعر", "Quotation")}</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm font-semibold">{t("الحالة", "Status")}</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="field-input w-full">
              <option value="all">{t("الكل", "All")}</option>
              {Object.entries(statusMap).map(([key, label]) => (
                <option key={key} value={key}>{isRtl ? label.ar : label.en}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm font-semibold">{t("بحث", "Search")}</label>
            <input value={searchId} onChange={e => setSearchId(e.target.value)} placeholder={t("رقم الطلب أو اسم العميل", "Order ID or customer")}
              className="field-input w-full" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <Table className="min-w-full">
          <TableHeader className="bg-secondary">
            <TableRow>
              {[t("رقم الطلب", "Order ID"), t("العميل", "Customer"), t("النوع", "Type"), t("الحالة", "Status"), t("الدفع", "Payment"), t("الإجمالي", "Total"), t("التاريخ", "Date"), t("إجراءات", "Actions")].map((heading, index) => (
                <TableHead key={index} className="px-4 py-3" style={{ textAlign: isRtl ? "right" : "left" }}>{heading}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => {
              const paymentLabel = order.paymentMethod === "cash" ? t("نقداً", "Cash") : t("تحويل بنكي", "Bank Transfer");
              const typeLabel = order.isQuotation ? t("عرض سعر", "Quotation") : t("طلب شراء", "Purchase");
              const statusLabel = isRtl
                ? statusMap[order.status]?.ar ?? t("غير معروف", "Unknown")
                : statusMap[order.status]?.en ?? t("Unknown", "Unknown");
              return (
                <TableRow key={order.id} className="border-t border-border hover:bg-secondary/50">
                  <TableCell className="px-4 py-3 font-semibold">{order.id}</TableCell>
                  <TableCell className="px-4 py-3">{order.customerName}</TableCell>
                  <TableCell className="px-4 py-3">{typeLabel}</TableCell>
                  <TableCell className="px-4 py-3">{statusLabel}</TableCell>
                  <TableCell className="px-4 py-3">{paymentLabel}</TableCell>
                  <TableCell className="px-4 py-3 font-bold text-primary">{order.total.toFixed(2)} $</TableCell>
                  <TableCell className="px-4 py-3 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString(isRtl ? "ar" : "en")}</TableCell>
                  <TableCell className="px-4 py-3 flex flex-wrap gap-2">
                    {order.status !== "closed" && (
                      <button onClick={() => updateStatus(order.id, order.status)}
                        className="px-3 py-1 rounded-xl bg-primary text-white text-xs font-semibold hover:opacity-90">
                        {t("تحديث", "Update")}
                      </button>
                    )}
                    {order.paymentMethod === "bank_transfer" && order.bankId && (
                      <span className="px-2 py-1 rounded-xl bg-blue-100 text-blue-700 text-xs">{banks.find((b) => b.id === order.bankId)?.[isRtl ? "nameAr" : "nameEn"]}</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {filteredOrders.length === 0 && (
        <div className="p-10 text-center text-muted-foreground">{t("لا توجد طلبات مطابقة", "No matching orders")}</div>
      )}
    </div>
  );
}

// ── Banks ─────────────────────────────────────────────────────────────
function BanksAdmin({ banks, setBanks, lang, t, isRtl }: any) {
  const [form, setForm] = useState({ nameAr: "", nameEn: "", accountNumber: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const save = () => {
    (async () => {
      if (editId) {
        try {
          const updated = await updateBank(editId, { ...form } as any);
          setBanks((prev: Bank[]) => prev.map((b: Bank) => b.id === editId ? updated : b));
        } catch (err) {
          console.error(err);
          alert(isRtl ? "فشل تحديث البنك" : "Failed to update bank");
          return;
        }
      } else {
        try {
          const created = await createBank({ ...form } as any);
          setBanks((prev: Bank[]) => [...prev, created]);
        } catch (err) {
          console.error(err);
          alert(isRtl ? "فشل إضافة البنك" : "Failed to create bank");
          return;
        }
      }
      setEditId(null); setForm({ nameAr: "", nameEn: "", accountNumber: "" }); setShowForm(false);
    })();
  };
  const toggle = (id: string) => {
    (async () => {
      try {
        const current = banks.find((b: Bank) => b.id === id);
        if (!current) return;
        const updated = await updateBank(id, { nameAr: current.nameAr, nameEn: current.nameEn, accountNumber: current.accountNumber, active: !current.active } as any);
        setBanks((prev: Bank[]) => prev.map((b: Bank) => b.id === id ? updated : b));
      } catch (err) {
        console.error(err);
        alert(isRtl ? "فشل تحديث حالة البنك" : "Failed to toggle bank");
      }
    })();
  };
  const del = (id: string) => {
    (async () => {
      if (!confirm(isRtl ? "هل تريد حذف هذا البنك؟" : "Delete this bank?")) return;
      try {
        await deleteBank(id);
        setBanks((prev: Bank[]) => prev.filter((b: Bank) => b.id !== id));
      } catch (err) {
        console.error(err);
        alert(isRtl ? "فشل حذف البنك" : "Failed to delete bank");
      }
    })();
  };
  const edit = (b: Bank) => { setForm({ nameAr: b.nameAr, nameEn: b.nameEn, accountNumber: b.accountNumber }); setEditId(b.id); setShowForm(true); };

  return (
    <div className="max-w-2xl">
      <SectionHeader title={t("إدارة البنوك", "Manage Banks")} onAdd={() => { setShowForm(true); setEditId(null); setForm({ nameAr: "", nameEn: "", accountNumber: "" }); }} addLabel={t("إضافة بنك", "Add Bank")} />
      {showForm && <FormBox title={editId ? t("تعديل بنك", "Edit Bank") : t("إضافة بنك", "Add Bank")} onSave={save} onCancel={() => { setShowForm(false); setEditId(null); }}>
        <Input label={t("الاسم بالعربية", "Arabic Name")} value={form.nameAr} onChange={v => setForm(f => ({ ...f, nameAr: v }))} />
        <Input label={t("الاسم بالإنجليزية", "English Name")} value={form.nameEn} onChange={v => setForm(f => ({ ...f, nameEn: v }))} />
        <div className="md:col-span-2"><Input label={t("رقم الحساب", "Account Number")} value={form.accountNumber} onChange={v => setForm(f => ({ ...f, accountNumber: v }))} /></div>
      </FormBox>}
      <div className="space-y-3">
        {banks.map((b: Bank) => (
          <div key={b.id} className="bg-white rounded-2xl border border-border p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #0D1E40, #1E3A6E)" }}>
              <Building2 size={20} className="text-white" />
            </div>
            <div className="flex-1"><div style={{ fontWeight: 700 }}>{isRtl ? b.nameAr : b.nameEn}</div><div className="text-muted-foreground text-sm font-mono">{b.accountNumber}</div></div>
            <button onClick={() => toggle(b.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold ${b.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {b.active ? <><CheckCircle size={14} />{t("مفعّل", "Active")}</> : <><XCircle size={14} />{t("موقوف", "Inactive")}</>}
            </button>
            <div className="flex gap-2"><button onClick={() => edit(b)} className="p-2 rounded-xl hover:bg-secondary text-primary"><Edit2 size={16} /></button><button onClick={() => del(b.id)} className="p-2 rounded-xl hover:bg-red-50 text-destructive"><Trash2 size={16} /></button></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Employees ─────────────────────────────────────────────────────────
function EmployeesAdmin({ employees, setEmployees, lang, t, isRtl }: any) {
  const [form, setForm] = useState({ nameAr: "", nameEn: "", phone: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const save = () => {
    (async () => {
      if (editId) {
        try {
          const updated = await updateEmployee(editId, { ...form } as any);
          setEmployees((prev: DeliveryEmployee[]) => prev.map((e: DeliveryEmployee) => e.id === editId ? updated : e));
        } catch (err) {
          console.error(err);
          alert(isRtl ? "فشل تحديث الموظف" : "Failed to update employee");
          return;
        }
      } else {
        try {
          const created = await createEmployee({ ...form } as any);
          setEmployees((prev: DeliveryEmployee[]) => [...prev, created]);
        } catch (err) {
          console.error(err);
          alert(isRtl ? "فشل إضافة الموظف" : "Failed to create employee");
          return;
        }
      }
      setEditId(null); setForm({ nameAr: "", nameEn: "", phone: "" }); setShowForm(false);
    })();
  };
  const toggle = (id: string) => {
    (async () => {
      try {
        const current = (employees as DeliveryEmployee[]).find((e: DeliveryEmployee) => e.id === id);
        if (!current) return;
        const updated = await updateEmployee(id, { nameAr: current.nameAr, nameEn: current.nameEn, phone: current.phone, active: !current.active } as any);
        setEmployees((prev: DeliveryEmployee[]) => prev.map((e: DeliveryEmployee) => e.id === id ? updated : e));
      } catch (err) {
        console.error(err);
        alert(isRtl ? "فشل تحديث حالة الموظف" : "Failed to toggle employee");
      }
    })();
  };
  const del = (id: string) => {
    (async () => {
      if (!confirm(isRtl ? "هل تريد حذف هذا الموظف؟" : "Delete this employee?")) return;
      try {
        await deleteEmployee(id);
        setEmployees((prev: DeliveryEmployee[]) => prev.filter((e: DeliveryEmployee) => e.id !== id));
      } catch (err) {
        console.error(err);
        alert(isRtl ? "فشل حذف الموظف" : "Failed to delete employee");
      }
    })();
  };
  const edit = (e: DeliveryEmployee) => { setForm({ nameAr: e.nameAr, nameEn: e.nameEn, phone: e.phone }); setEditId(e.id); setShowForm(true); };

  return (
    <div className="max-w-2xl">
      <SectionHeader title={t("موظفو التوصيل", "Delivery Employees")} onAdd={() => { setShowForm(true); setEditId(null); setForm({ nameAr: "", nameEn: "", phone: "" }); }} addLabel={t("إضافة موظف", "Add Employee")} />
      {showForm && <FormBox title={editId ? t("تعديل موظف", "Edit Employee") : t("موظف جديد", "New Employee")} onSave={save} onCancel={() => { setShowForm(false); setEditId(null); }}>
        <Input label={t("الاسم بالعربية", "Arabic Name")} value={form.nameAr} onChange={v => setForm(f => ({ ...f, nameAr: v }))} />
        <Input label={t("الاسم بالإنجليزية", "English Name")} value={form.nameEn} onChange={v => setForm(f => ({ ...f, nameEn: v }))} />
        <Input label={t("رقم الهاتف", "Phone")} value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} />
      </FormBox>}
      <div className="space-y-3">
        {employees.map((e: DeliveryEmployee) => (
          <div key={e.id} className="bg-white rounded-2xl border border-border p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #0D1E40, #1E3A6E)" }}><Truck size={20} className="text-white" /></div>
            <div className="flex-1"><div style={{ fontWeight: 700 }}>{isRtl ? e.nameAr : e.nameEn}</div><div className="text-muted-foreground text-sm">📞 {e.phone}</div></div>
            <button onClick={() => toggle(e.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold ${e.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {e.active ? <><CheckCircle size={14} />{t("مفعّل", "Active")}</> : <><XCircle size={14} />{t("موقوف", "Inactive")}</>}
            </button>
            <div className="flex gap-2"><button onClick={() => edit(e)} className="p-2 rounded-xl hover:bg-secondary text-primary"><Edit2 size={16} /></button><button onClick={() => del(e.id)} className="p-2 rounded-xl hover:bg-red-50 text-destructive"><Trash2 size={16} /></button></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Staff ─────────────────────────────────────────────────────────────
function StaffAdmin({ staff, setStaff, lang, t, isRtl }: any) {
  const roles = [{ v: "admin", ar: "مدير النظام", en: "Admin" }, { v: "customer_service", ar: "خدمة العملاء", en: "Customer Service" }, { v: "warehouse", ar: "المخازن", en: "Warehouse" }, { v: "delivery", ar: "التوصيل", en: "Delivery" }];
  const [form, setForm] = useState({ nameAr: "", nameEn: "", username: "", password: "", role: "customer_service" as StaffUser["role"] });
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const save = () => {
    (async () => {
      if (editId) {
        try {
          const updated = await updateStaffUser(editId, { ...form } as any);
          setStaff((prev: StaffUser[]) => prev.map((s: StaffUser) => s.id === editId ? updated : s));
        } catch (err) {
          console.error(err);
          alert(isRtl ? "فشل تحديث المستخدم" : "Failed to update staff user");
          return;
        }
      } else {
        try {
          const created = await createStaffUser({ ...form } as any);
          setStaff((prev: StaffUser[]) => [...prev, created]);
        } catch (err) {
          console.error(err);
          alert(isRtl ? "فشل إضافة المستخدم" : "Failed to create staff user");
          return;
        }
      }
      setEditId(null); setForm({ nameAr: "", nameEn: "", username: "", password: "", role: "customer_service" }); setShowForm(false);
    })();
  };
  const toggle = (id: string) => {
    (async () => {
      try {
        const current = staff.find((s: StaffUser) => s.id === id);
        if (!current) return;
        const updated = await updateStaffUser(id, { nameAr: current.nameAr, nameEn: current.nameEn, username: current.username, password: current.password, role: current.role, active: !current.active } as any);
        setStaff((prev: StaffUser[]) => prev.map((s: StaffUser) => s.id === id ? updated : s));
      } catch (err) {
        console.error(err);
        alert(isRtl ? "فشل تحديث حالة المستخدم" : "Failed to toggle staff user");
      }
    })();
  };
  const del = (id: string) => {
    (async () => {
      if (!confirm(isRtl ? "هل تريد حذف هذا المستخدم؟" : "Delete this staff user?")) return;
      try {
        await deleteStaffUser(id);
        setStaff((prev: StaffUser[]) => prev.filter((s: StaffUser) => s.id !== id));
      } catch (err) {
        console.error(err);
        alert(isRtl ? "فشل حذف المستخدم" : "Failed to delete staff user");
      }
    })();
  };
  const edit = (s: StaffUser) => { setForm({ nameAr: s.nameAr, nameEn: s.nameEn, username: s.username, password: s.password, role: s.role }); setEditId(s.id); setShowForm(true); };

  return (
    <div className="max-w-3xl">
      <SectionHeader title={t("إدارة المستخدمين", "Manage Staff")} onAdd={() => { setShowForm(true); setEditId(null); }} addLabel={t("إضافة مستخدم", "Add User")} />
      {showForm && <FormBox title={editId ? t("تعديل مستخدم", "Edit User") : t("مستخدم جديد", "New User")} onSave={save} onCancel={() => { setShowForm(false); setEditId(null); }}>
        <Input label={t("الاسم بالعربية", "Arabic Name")} value={form.nameAr} onChange={v => setForm(f => ({ ...f, nameAr: v }))} />
        <Input label={t("الاسم بالإنجليزية", "English Name")} value={form.nameEn} onChange={v => setForm(f => ({ ...f, nameEn: v }))} />
        <Input label={t("اسم المستخدم", "Username")} value={form.username} onChange={v => setForm(f => ({ ...f, username: v }))} />
        <Input label={t("كلمة المرور", "Password")} value={form.password} onChange={v => setForm(f => ({ ...f, password: v }))} />
        <div className="md:col-span-2">
          <label className="block mb-1.5" style={{ fontSize: "14px", fontWeight: 600 }}>{t("الصلاحية", "Role")}</label>
          <select value={form.role || ""} onChange={e => setForm(f => ({ ...f, role: e.target.value as any }))} className="field-input">
            {roles.map(r => <option key={r.v} value={r.v}>{isRtl ? r.ar : r.en}</option>)}
          </select>
        </div>
      </FormBox>}
      <div className="space-y-3">
        {staff.map((s: StaffUser) => (
          <div key={s.id} className="bg-white rounded-2xl border border-border p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #0D1E40, #1E3A6E)" }}><Users size={20} className="text-white" /></div>
            <div className="flex-1"><div style={{ fontWeight: 700 }}>{isRtl ? s.nameAr : s.nameEn}</div><div className="text-muted-foreground text-sm">@{s.username} · {roles.find(r => r.v === s.role)?.[isRtl ? "ar" : "en"]}</div></div>
            <button onClick={() => toggle(s.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold ${s.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {s.active ? <><CheckCircle size={14} />{t("مفعّل", "Active")}</> : <><XCircle size={14} />{t("موقوف", "Inactive")}</>}
            </button>
            <div className="flex gap-2"><button onClick={() => edit(s)} className="p-2 rounded-xl hover:bg-secondary text-primary"><Edit2 size={16} /></button><button onClick={() => del(s.id)} className="p-2 rounded-xl hover:bg-red-50 text-destructive"><Trash2 size={16} /></button></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Revenue ───────────────────────────────────────────────────────────
function RevenueAdmin({ orders, banks, lang, t, isRtl }: any) {
  const [filterType, setFilterType] = useState<"all" | "cash" | "bank_transfer">("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const closed = orders.filter((o: any) => (o.status === "delivered" || o.status === "closed") && !o.isQuotation);
  const filtered = closed.filter((o: any) => {
    const matchType = filterType === "all" || o.paymentMethod === filterType;
    const d = new Date(o.createdAt);
    return matchType && (!fromDate || d >= new Date(fromDate)) && (!toDate || d <= new Date(toDate + "T23:59:59"));
  });
  const totalCash = filtered.filter((o: any) => o.paymentMethod === "cash").reduce((s: number, o: any) => s + o.total, 0);
  const totalBank = filtered.filter((o: any) => o.paymentMethod === "bank_transfer").reduce((s: number, o: any) => s + o.total, 0);
  const byBank = banks.map((b: any) => ({ ...b, revenue: filtered.filter((o: any) => o.bankId === b.id).reduce((s: number, o: any) => s + o.total, 0) }));

  return (
    <div className="max-w-3xl">
      <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--primary)", marginBottom: "24px" }}>{t("تقارير الإيرادات", "Revenue Reports")}</h2>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: t("إجمالي الإيرادات", "Total Revenue"), value: totalCash + totalBank, icon: <TrendingUp size={22} />, grad: "linear-gradient(135deg, #0D1E40, #1E3A6E)" },
          { label: t("الإيرادات النقدية", "Cash Revenue"), value: totalCash, icon: <DollarSign size={22} />, grad: "linear-gradient(135deg, #166534, #15803d)" },
          { label: t("التحويل البنكي", "Bank Transfer"), value: totalBank, icon: <Building2 size={22} />, grad: "linear-gradient(135deg, #1e40af, #2563eb)" },
        ].map((c, i) => (
          <div key={i} className="rounded-2xl p-5 text-white" style={{ background: c.grad }}>
            <div className="opacity-80 mb-2">{c.icon}</div>
            <div style={{ fontWeight: 900, fontSize: "24px" }}>${c.value.toFixed(2)}</div>
            <div style={{ opacity: 0.75, fontSize: "12px" }}>{c.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-border p-5 mb-5">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1.5 text-sm font-semibold">{t("نوع الدفع", "Payment Type")}</label>
            <select value={filterType} onChange={e => setFilterType(e.target.value as any)} className="field-input">
              <option value="all">{t("الكل", "All")}</option>
              <option value="cash">{t("نقداً", "Cash")}</option>
              <option value="bank_transfer">{t("تحويل بنكي", "Bank Transfer")}</option>
            </select>
          </div>
          <div><label className="block mb-1.5 text-sm font-semibold">{t("من تاريخ", "From Date")}</label><input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="field-input" /></div>
          <div><label className="block mb-1.5 text-sm font-semibold">{t("إلى تاريخ", "To Date")}</label><input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="field-input" /></div>
        </div>
      </div>
      {byBank.some((b: any) => b.revenue > 0) && (
        <div className="bg-white rounded-2xl border border-border p-5 mb-5">
          <div style={{ fontWeight: 700, color: "var(--primary)", marginBottom: "12px" }}>{t("الإيرادات حسب البنك", "Revenue by Bank")}</div>
          {byBank.filter((b: any) => b.revenue > 0).map((b: any) => (
            <div key={b.id} className="flex justify-between py-2 border-b border-border last:border-0">
              <span>{isRtl ? b.nameAr : b.nameEn}</span>
              <span style={{ fontWeight: 700, color: "var(--accent)" }}>${b.revenue.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border" style={{ fontWeight: 700, color: "var(--primary)" }}>{t("الطلبات المكتملة", "Completed Orders")} ({filtered.length})</div>
        {filtered.length === 0 ? <div className="p-8 text-center text-muted-foreground">{t("لا توجد طلبات", "No orders found")}</div> : (
          <Table className="min-w-full">
            <TableHeader className="bg-secondary">
              <TableRow>
                {[t("رقم الطلب", "Order ID"), t("العميل", "Customer"), t("الدفع", "Payment"), t("الإجمالي", "Total"), t("التاريخ", "Date")].map((h, i) => (
                  <TableHead key={i} className="px-4 py-3" style={{ textAlign: isRtl ? "right" : "left" }}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((o: any) => (
                <TableRow key={o.id} className="border-t border-border hover:bg-secondary/50">
                  <TableCell className="px-4 py-3 font-semibold">{o.id}</TableCell>
                  <TableCell className="px-4 py-3">{o.customerName}</TableCell>
                  <TableCell className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-semibold ${o.paymentMethod === "cash" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>{o.paymentMethod === "cash" ? t("نقداً", "Cash") : t("بنكي", "Bank")}</span></TableCell>
                  <TableCell className="px-4 py-3 font-bold text-primary">${o.total.toFixed(2)}</TableCell>
                  <TableCell className="px-4 py-3 text-muted-foreground">{new Date(o.createdAt).toLocaleDateString(isRtl ? "ar" : "en")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

// ── Reviews ───────────────────────────────────────────────────────────
function ReviewsAdmin({ reviews, setReviews, lang, t, isRtl }: any) {
  const [filter, setFilter] = useState<"all" | "review" | "complaint" | "suggestion">("all");
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const filtered = reviews.filter((r: any) => filter === "all" || r.type === filter);
  const toggle = (id: string) => {
    (async () => {
      try {
        const current = reviews.find((r: any) => r.id === id);
        if (!current) return;
        const updated = await updateReview(id, { customerName: current.customerName, rating: current.rating, comment: current.comment, type: current.type, hidden: !current.hidden, reply: current.reply ?? null } as any);
        setReviews((prev: any[]) => prev.map(r => r.id === id ? updated : r));
      } catch (err) {
        console.error(err);
        alert(isRtl ? "فشل تحديث التقييم" : "Failed to update review");
      }
    })();
  };
  const submitReply = (id: string) => {
    (async () => {
      try {
        const current = reviews.find((r: any) => r.id === id);
        if (!current) return;
        const updated = await updateReview(id, { reply: replyText, customerName: current.customerName, rating: current.rating, comment: current.comment, type: current.type, hidden: current.hidden } as any);
        setReviews((prev: any[]) => prev.map(r => r.id === id ? updated : r));
        setReplyId(null); setReplyText("");
      } catch (err) {
        console.error(err);
        alert(isRtl ? "فشل إرسال الرد" : "Failed to submit reply");
      }
    })();
  };
  const typeColor: Record<string, string> = { review: "bg-blue-100 text-blue-700", complaint: "bg-red-100 text-red-700", suggestion: "bg-purple-100 text-purple-700" };
  const typeLabel: Record<string, { ar: string; en: string }> = { review: { ar: "تقييم", en: "Review" }, complaint: { ar: "شكوى", en: "Complaint" }, suggestion: { ar: "اقتراح", en: "Suggestion" } };

  return (
    <div className="max-w-3xl">
      <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--primary)", marginBottom: "20px" }}>{t("التقييمات والشكاوى", "Reviews & Complaints")}</h2>
      <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1.5 border border-border w-fit">
        {([["all", t("الكل", "All")], ["review", t("تقييمات", "Reviews")], ["complaint", t("شكاوى", "Complaints")], ["suggestion", t("اقتراحات", "Suggestions")]] as [string, string][]).map(([k, label]) => (
          <button key={k} onClick={() => setFilter(k as any)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === k ? "text-white" : "hover:bg-secondary"}`} style={filter === k ? { background: "linear-gradient(135deg, #0D1E40, #1E3A6E)" } : {}}>
            {label}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {filtered.map((r: any) => (
          <div key={r.id} className={`bg-white rounded-2xl border border-border overflow-hidden ${r.hidden ? "opacity-50" : ""}`}>
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: "linear-gradient(135deg, #0D1E40, #1E3A6E)" }}>{r.customerName[0]}</div>
                  <div><div style={{ fontWeight: 700 }}>{r.customerName}</div><div className="text-muted-foreground text-xs">{new Date(r.createdAt).toLocaleDateString(isRtl ? "ar" : "en")}</div></div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${typeColor[r.type]}`}>{isRtl ? typeLabel[r.type].ar : typeLabel[r.type].en}</span>
                  {r.type === "review" && <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} size={13} className={s <= r.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"} />)}</div>}
                </div>
              </div>
              <p className="mb-4" style={{ fontSize: "14px" }}>{r.comment}</p>
              {r.reply && <div className="p-3 rounded-xl bg-secondary border border-border text-sm"><div className="text-muted-foreground mb-1 font-semibold">{t("رد الإدارة:", "Admin Reply:")}</div><div>{r.reply}</div></div>}
              {replyId === r.id && (
                <div className="mt-3 space-y-2">
                  <textarea rows={2} value={replyText} onChange={e => setReplyText(e.target.value)} className="w-full field-input resize-none text-sm" placeholder={t("اكتب ردك...", "Write your reply...")} />
                  <div className="flex gap-2">
                    <button onClick={() => submitReply(r.id)} className="px-4 py-2 rounded-xl text-white text-sm font-semibold hover:opacity-90" style={{ background: "linear-gradient(135deg, #0D1E40, #1E3A6E)" }}>{t("إرسال", "Send")}</button>
                    <button onClick={() => { setReplyId(null); setReplyText(""); }} className="px-4 py-2 rounded-xl border border-border text-sm hover:bg-secondary">{t("إلغاء", "Cancel")}</button>
                  </div>
                </div>
              )}
            </div>
            <div className="border-t border-border px-5 py-3 bg-secondary/40 flex gap-4">
              <button onClick={() => { setReplyId(r.id); setReplyText(r.reply || ""); }} className="flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline"><MessageSquare size={14} />{t("رد", "Reply")}</button>
              <button onClick={() => toggle(r.id)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                {r.hidden ? <><Eye size={14} />{t("إظهار", "Show")}</> : <><EyeOff size={14} />{t("إخفاء", "Hide")}</>}
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="p-10 text-center text-muted-foreground bg-white rounded-2xl border border-border">{t("لا توجد عناصر", "No items found")}</div>}
      </div>
    </div>
  );
}
