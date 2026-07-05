import { useState } from "react";
import { ShoppingCart, Search, SlidersHorizontal } from "lucide-react";
import { useApp } from "../context/AppContext";
import heroImage from "../../imports/sta.png";
import heroImage1 from "../../imports/comp.png"; 
import heroImage2 from "../../imports/bank.png";
import heroImage3 from "../../imports/hhhrrr.png";

interface ProductsPageProps {
  categoryId: string;
}

export function ProductsPage({ categoryId }: ProductsPageProps) {
  const { lang, t, products, categories, addToCart, setCurrentPage, currency } = useApp();
  const isRtl = lang === "ar";
  const [search, setSearch] = useState("");
  const [addedId, setAddedId] = useState<string | null>(null);
  const [qty, setQty] = useState<Record<string, number>>({});

  const category = categories.find(c => c.id === categoryId);
  const filtered = products.filter(p => p.category === categoryId && p.available && (
    search === "" || p.nameAr.includes(search) || p.nameEn.toLowerCase().includes(search.toLowerCase())
  ));

  // ✅ ربط الصور المحلية مع الأقسام
  const heroBg: Record<string, string> = {
    stationery: heroImage,
    computers: heroImage1,
    banking: heroImage2,
  };

  // ✅ إذا ما تطابق القسم، استخدم الصورة الافتراضية
  const bgUrl: string = heroBg[categoryId] || heroImage3;

  const handleAdd = (p: typeof products[0]) => {
    addToCart(p, qty[p.id] || 1);
    setAddedId(p.id);
    window.setTimeout(() => setAddedId(null), 1400);
  };

  return (
    <div dir={isRtl ? "rtl" : "ltr"} style={{ fontFamily: isRtl ? "Cairo, sans-serif" : "Inter, sans-serif" }}>
      {/* Hero */}
      <div className="relative overflow-hidden min-h-[220px] sm:min-h-[260px]" style={{ height: "clamp(220px, 30vw, 280px)" }}>
        <img src={bgUrl} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(10,22,40,0.80), rgba(30,58,110,0.75))" }}>
          <div className="text-center text-white">
            <div style={{ fontSize: "48px", marginBottom: "8px" }}>{category?.icon || "📦"}</div>
            <h1 style={{ fontSize: "clamp(22px, 4vw, 36px)", fontWeight: 900, marginBottom: "6px" }}>
              {category ? (isRtl ? category.nameAr : category.nameEn) : categoryId}
            </h1>
            <p style={{ opacity: 0.75, fontSize: "15px" }}>{filtered.length} {t("منتج متوفر", "products available")}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-8 items-stretch sm:items-center">
          <div className="relative flex-1 min-w-[240px] max-w-full sm:max-w-md">
            <Search size={18} className="absolute top-1/2 -translate-y-1/2 text-muted-foreground" style={{ [isRtl ? "right" : "left"]: "14px" }} />
            <input
              placeholder={t("ابحث عن منتج...", "Search products...")}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full py-3 rounded-2xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
              style={{ [isRtl ? "paddingRight" : "paddingLeft"]: "44px", paddingLeft: isRtl ? "16px" : "44px", paddingRight: isRtl ? "44px" : "16px" }}
            />
          </div>
          <button
            onClick={() => setCurrentPage("cart")}
            className="btn-primary w-full sm:w-auto"
            style={{ background: "linear-gradient(135deg, #C49A20, #D4A820)" }}
          >
            <ShoppingCart size={18} />
            {t("عرض السلة", "View Cart")}
          </button>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <SlidersHorizontal size={56} className="mx-auto mb-4 opacity-30" />
            <p style={{ fontSize: "18px", fontWeight: 600 }}>{t("لا توجد منتجات", "No products found")}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map(p => (
              <div key={p.id} className="soft-card overflow-hidden hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                <div className="image-card" style={{ height: "200px" }}>
                  <img src={p.image} alt={isRtl ? p.nameAr : p.nameEn} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 style={{ fontWeight: 700, color: "var(--foreground)", marginBottom: "6px", fontSize: "15px" }}>
                    {isRtl ? p.nameAr : p.nameEn}
                  </h3>
                  <p className="text-muted-foreground flex-1 mb-4" style={{ fontSize: "13px", lineHeight: 1.6 }}>
                    {isRtl ? p.descAr : p.descEn}
                  </p>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-muted-foreground text-sm">{t("الكمية:", "Qty:")}</span>
                    <input
                      type="number" min={1} max={p.stock}
                      value={qty[p.id] || 1}
                      onChange={e => setQty(q => ({ ...q, [p.id]: Math.max(1, parseInt(e.target.value) || 1) }))}
                      className="w-20 px-3 py-1.5 rounded-xl border border-border text-center focus:outline-none focus:ring-2 focus:ring-primary/20 bg-input-background"
                      style={{ fontSize: "14px" }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div style={{ fontWeight: 900, fontSize: "22px", color: "var(--primary)" }}>
                        {currency}{p.price.toFixed(2)}
                      </div>
                      <div className="text-muted-foreground" style={{ fontSize: "11px" }}>
                        {t("المتوفر:", "Stock:")} {p.stock}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAdd(p)}
                      className={`btn-primary justify-center px-4 py-2.5 text-sm w-full sm:w-auto ${addedId === p.id ? "btn-success" : ""}`}
                      style={addedId === p.id ? {} : { background: "linear-gradient(135deg, #0D1E40, #1E3A6E)" }}
                      aria-pressed={addedId === p.id}
                    >
                      {addedId === p.id ? (
                        <><span>✓</span> {t("أضيف", "Added")}</>
                      ) : (
                        <><ShoppingCart size={16} /> {t("أضف", "Add")}</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
