import { ShoppingCart, Globe, Menu, X, LogIn, LogOut, Bell } from "lucide-react";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import { CompanyLogo } from "./CompanyLogo";


export function Navbar() {
  const { lang, setLang, t, cart, currentPage, setCurrentPage, currentUser, logout, categories, newOrdersCount, setNewOrdersCount } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const isRtl = lang === "ar";

  const staticNav = [
    { key: "home", ar: "الرئيسية", en: "Home" },
    { key: "track", ar: "تتبع الطلب", en: "Track Order" },
  ];

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <nav dir={isRtl ? "rtl" : "ltr"} style={{ background: "linear-gradient(135deg, #0A1628 0%, #0D1E40 60%, #1E3A6E 100%)", fontFamily: isRtl ? "Cairo, sans-serif" : "Inter, sans-serif" }} className="text-white shadow-2xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-0">
        <div className="flex items-center justify-between" style={{ height: "68px" }}>

          {/* Logo */}
          <button onClick={() => setCurrentPage("home")} className="flex items-center gap-3 hover:opacity-90 transition-opacity flex-shrink-0">
            <div className="flex-shrink-0">
              <CompanyLogo size="sm" />
            </div>
            <div className={isRtl ? "text-right" : "text-left"}>
              <div style={{ fontFamily: "Cairo, sans-serif", fontWeight: 800, fontSize: "16px", lineHeight: 1.2, letterSpacing: isRtl ? "0" : "0.2px" }}>
                {t("شركة الصداقة", "FriendShip Co.")}
              </div>
              <div style={{ fontSize: "11px", opacity: 0.65, lineHeight: 1.2 }}>
                {t("للتجارة والتوكيلات العامة", "Trading & General Agencies")}
              </div>
            </div>
          </button>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {staticNav.slice(0, 1).map(item => (
              <button
                key={item.key}
                onClick={() => setCurrentPage(item.key)}
                className={`px-3.5 py-2 rounded-lg transition-all text-sm ${currentPage === item.key ? "bg-white/20 font-semibold" : "hover:bg-white/10"}`}
              >
                {isRtl ? item.ar : item.en}
              </button>
            ))}

            {/* Dynamic category links */}
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCurrentPage(`cat_${cat.id}`)}
                className={`px-3.5 py-2 rounded-lg transition-all text-sm flex items-center gap-1.5 ${currentPage === `cat_${cat.id}` ? "bg-white/20 font-semibold" : "hover:bg-white/10"}`}
              >
                <span style={{ fontSize: "14px" }}>{cat.icon}</span>
                {isRtl ? cat.nameAr : cat.nameEn}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage("track")}
              className={`px-3.5 py-2 rounded-lg transition-all text-sm ${currentPage === "track" ? "bg-white/20 font-semibold" : "hover:bg-white/10"}`}
            >
              {t("تتبع الطلب", "Track Order")}
            </button>

            {/* Convert quotation */}
            <button
              onClick={() => setCurrentPage("quotation_purchase")}
              className={`px-3.5 py-2 rounded-lg transition-all text-sm border border-yellow-400/50 flex items-center gap-1.5 ${currentPage === "quotation_purchase" ? "bg-yellow-400/20" : "hover:bg-yellow-400/10"}`}
              style={{ color: "#F0C040" }}
            >
              📋 {t("طلب شراء من عرض سعر", "Purchase from Quotation")}
            </button>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Lang toggle */}
            <button
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/25 hover:bg-white/15 transition-colors text-sm"
            >
              <Globe size={14} />
              {lang === "ar" ? "EN" : "عربي"}
            </button>

            {/* Cart */}
            <button
              onClick={() => setCurrentPage("cart")}
              className="relative p-2.5 rounded-full hover:bg-white/15 transition-colors"
              aria-label={t("السلة", "Cart")}
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white"
                  style={{ fontSize: "11px", fontWeight: 800, background: "linear-gradient(135deg, #D4A820, #C49A20)" }}
                >
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>

            {/* Staff portal */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => { setCurrentPage("portal"); }}
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #C49A20, #D4A820)", color: "#fff" }}
                  >
                    {t("لوحة التحكم", "Panel")}
                  </button>
                  {newOrdersCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs" style={{ background: "#ef4444", fontWeight: 800 }}>
                      {newOrdersCount > 9 ? "9+" : newOrdersCount}
                    </span>
                  )}
                </div>
                <button onClick={logout} className="p-2 rounded-full hover:bg-white/15 transition-colors" title={t("خروج", "Sign Out")}>
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCurrentPage("login")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/25 hover:bg-white/15 transition-colors text-sm"
              >
                <LogIn size={16} />
                {t("دخول الموظفين", "Staff Login")}
              </button>
            )}

            {/* Mobile menu */}
            <button className="lg:hidden p-2 rounded-full hover:bg-white/15 transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
          {/* Toast notification for new orders (desktop) */}
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-white/15 py-3 flex flex-col gap-1 pb-4">
            <button onClick={() => { setCurrentPage("home"); setMenuOpen(false); }} className={`text-${isRtl ? "right" : "left"} px-4 py-2.5 rounded-lg hover:bg-white/10 text-sm`}>
              {t("الرئيسية", "Home")}
            </button>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => { setCurrentPage(`cat_${cat.id}`); setMenuOpen(false); }} className={`text-${isRtl ? "right" : "left"} px-4 py-2.5 rounded-lg hover:bg-white/10 text-sm flex items-center gap-2`}>
                <span>{cat.icon}</span>{isRtl ? cat.nameAr : cat.nameEn}
              </button>
            ))}
            <button onClick={() => { setCurrentPage("track"); setMenuOpen(false); }} className={`text-${isRtl ? "right" : "left"} px-4 py-2.5 rounded-lg hover:bg-white/10 text-sm`}>
              {t("تتبع الطلب", "Track Order")}
            </button>
            <button onClick={() => { setCurrentPage("quotation_purchase"); setMenuOpen(false); }} className="text-left px-4 py-2.5 rounded-lg text-sm" style={{ color: "#F0C040" }}>
              📋 {t("طلب شراء من عرض سعر", "Purchase from Quotation")}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
