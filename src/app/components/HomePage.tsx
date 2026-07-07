import { useState, useEffect, useRef } from "react";
import { Star, ChevronLeft, ChevronRight, Send, Phone, Mail, MapPin, Award, Shield, Truck, Users, X } from "lucide-react";
import { useApp } from "../context/AppContext";
import { CompanyLogo } from "./CompanyLogo";
import heroImage from "../../imports/_______.png";
import heroImage2 from "../../imports/office.png";
import { createReview } from "../lib/api";


export function HomePage() {
  const { lang, t, products, categories, setCurrentPage, addToCart, reviews, setReviews, currency } = useApp();
  const isRtl = lang === "ar";
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 5, comment: "", type: "review" as "review" | "complaint" | "suggestion" });
  const [complaintForm, setComplaintForm] = useState({ name: "", message: "" });
  // داخل الكومبوننت HomePage
  const [suggestionForm, setSuggestionForm] = useState({ name: "", message: "" });
  const [suggestionSuccess, setSuggestionSuccess] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [complaintSuccess, setComplaintSuccess] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const sectionsRef = useRef<HTMLElement | null>(null);

  const featured = products.filter(p => p.available).slice(0, 4);
  const visibleReviews = reviews.filter(r => !r.hidden && r.type === "review");

  const stats = [
    { icon: <Users size={28} />, value: "500+", label: t("عميل راضٍ", "Happy Clients") },
    { icon: <Award size={28} />, value: "10+", label: t("سنوات خبرة", "Years Experience") },
    { icon: <Truck size={28} />, value: "1000+", label: t("طلب مُسلَّم", "Orders Delivered") },
    { icon: <Shield size={28} />, value: "100%", label: t("ضمان الجودة", "Quality Guarantee") },
  ];
const handleReviewSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await createReview({
      customerName: reviewForm.name,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
      type: reviewForm.type,
      reply: "",
    });
    setFormSuccess(true);
    setReviewForm({ name: "", rating: 5, comment: "", type: "review" });
    setTimeout(() => setFormSuccess(false), 3000);
  } catch {
    alert("فشل إرسال التقييم");
  }
};

const handleComplaintSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await createReview({
      customerName: complaintForm.name,
      rating: 0,
      comment: complaintForm.message,
      type: "complaint",
      reply: "",
    });
    setComplaintSuccess(true);
    setComplaintForm({ name: "", message: "" });
    setTimeout(() => setComplaintSuccess(false), 3000);
  } catch {
    alert("فشل إرسال الشكوى");
  }
};

const handleSuggestionSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await createReview({
      customerName: suggestionForm.name,
      rating: 0,
      comment: suggestionForm.message,
      type: "suggestion",
      reply: "",
    });
    setSuggestionSuccess(true);
    setSuggestionForm({ name: "", message: "" });
    setTimeout(() => setSuggestionSuccess(false), 3000);
  } catch {
    alert("فشل إرسال الاقتراح");
  }
};

  const catHeroBg = { stationery: "#1E3A6E", computers: "#1A3050", banking: "#163040" };

  const handleBrowseProducts = () => {
    const top = (sectionsRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY - 90;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const handlePhoneCall = () => {
    window.location.href = "tel:+967775031963";
  };

  return (
    <div dir={isRtl ? "rtl" : "ltr"} style={{ fontFamily: isRtl ? "Cairo, sans-serif" : "Inter, sans-serif" }}>
      


      {/* Hero */}
      <section className="relative overflow-hidden min-h-[420px] md:min-h-[520px]" style={{ background: "linear-gradient(135deg, #0A1628 0%, #0D1E40 50%, #1A3560 100%)" }}>
        {/* Decorative shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute rounded-full opacity-10" style={{ width: "600px", height: "600px", background: "radial-gradient(circle, #3B6FD4, transparent)", top: "-200px", right: isRtl ? "-100px" : "auto", left: isRtl ? "auto" : "-100px" }} />
          <div className="absolute rounded-full opacity-8" style={{ width: "400px", height: "400px", background: "radial-gradient(circle, #C49A20, transparent)", bottom: "-100px", left: isRtl ? "-50px" : "auto", right: isRtl ? "auto" : "-50px" }} />
          
          

          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>
            
            
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20 flex flex-col lg:flex-row items-center gap-8 md:gap-12">
          <div className={`flex-1 text-white ${isRtl ? "text-right" : "text-left"}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border border-yellow-400/30" style={{ background: "rgba(196,154,32,0.15)", color: "#F0C040", fontSize: "14px", fontWeight: 600 }}>
              <span>✦</span> {t("شركة الصداقة للتجارة والتوكيلات العامة", "FriendShip Trading & General Agencies")}
            </div>
            <h2 style={{ fontFamily: "Cairo, sans-serif", fontWeight: 800, fontSize: "26px", marginBottom: "8px" }}>
                {t("مرحباً بكم في شركة الصداقة", "Welcome to FriendShip Company")}
              </h2>
              <p style={{ fontSize: "18px", lineHeight: 1.8, opacity: 1.8, maxWidth: "520px", marginBottom: "36px" }}>
                {t(
                  "يسعدنا ترحيبكم في موقعنا الإلكتروني. نقدم لكم أفضل المنتجات المكتبية والإلكترونية والخدمات البنكية بجودة عالية وأسعار تنافسية مع توصيل سريع وموثوق.",
                  "We are pleased to welcome you to our website. We offer the best office, electronics, and banking products with top quality, competitive prices, and fast reliable delivery."
                )}
              </p>
            <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", fontWeight: 900, lineHeight: 1.15, marginBottom: "20px" }}>
              {t("وجهتك الأولى", "Your First Choice")}
              <br />
              <span style={{ background: "linear-gradient(90deg, #D4A820, #F0C040)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {t("للتجارة والخدمات", "For Commerce & Services")}
              </span>
            </h1>
            <p style={{ fontSize: "17px", lineHeight: 1.8, opacity: 0.8, maxWidth: "520px", marginBottom: "36px" }}>
              {t(
                "نوفر أفضل المنتجات المكتبية والإلكترونية والخدمات البنكية بجودة عالية وأسعار تنافسية مع توصيل سريع وموثوق.",
                "We provide the best office, electronics, and banking services with top quality, competitive prices, and fast reliable delivery."
              )}
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
              <button
                onClick={handleBrowseProducts}
                className="btn-primary w-full sm:w-auto"
                style={{ background: "linear-gradient(135deg, #C49A20, #D4A820)", fontSize: "16px" }}
              >
                {t("تصفح المنتجات", "Browse Products")}
              </button>
              <button
                onClick={() => setCurrentPage("track")}
                className="btn-secondary w-full sm:w-auto"
                style={{ fontSize: "16px" }}
              >
                {t("تتبع طلبك", "Track Your Order")}
              </button>
            </div>
          </div>

          <div className="flex-shrink-0 w-full max-w-[420px]">
            <div className="hero-image-frame w-full aspect-[4/5] sm:aspect-[4/3] lg:h-[420px] mx-auto">
              <img src={heroImage} alt={t("صورة الصفحة الرئيسية", "Homepage image")} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>
            <div className="mt-6 rounded-3xl border border-white/10 bg-white/10 p-4 text-white backdrop-blur-sm shadow-sm">
              <div className="flex items-center gap-2 font-semibold text-sm mb-1">
                <Award size={16} className="text-yellow-300" />
                {t("شركة الصداقة", "FriendShip Company")}
              </div>
              <div className="flex items-center gap-2 text-[13px] opacity-80 mb-3">
                <Shield size={14} className="text-slate-200" />
                {t("التجارة والتوكيلات العامة", "Trading & General Agencies")}
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-[13px] text-white">
                <Truck size={14} className="text-yellow-300" />
                {t("تسليم سريع وموثوق", "Fast & reliable delivery")}
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 lg:hidden">
              {stats.map((s, i) => (
                <div key={i} className="px-4 py-3 rounded-xl text-center border border-white/10 backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.07)" }}>
                  <div className="text-yellow-400 flex justify-center mb-1">{s.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: "20px" }}>{s.value}</div>
                  <div style={{ fontSize: "11px", opacity: 0.7 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar (mobile) */}
      <section className="lg:hidden bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 gap-5">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="flex justify-center mb-1 text-primary">{s.icon}</div>
              <div style={{ fontWeight: 800, fontSize: "24px", color: "var(--primary)" }}>{s.value}</div>
              <div className="text-muted-foreground" style={{ fontSize: "13px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block px-3 py-1 rounded-full mb-3 text-sm font-semibold" style={{ background: "rgba(196,154,32,0.12)", color: "#A07A10" }}>
              {t("من نحن", "About Us")}
            </div>
            <h2 style={{ fontSize: "32px", fontWeight: 800, color: "var(--primary)", marginBottom: "16px" }}>
              {t("نبذة عن الشركة", "Company Overview")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6" style={{ fontSize: "16px" }}>
              {t(
                "شركة الصداقة للتجارة والتوكيلات العامة شركة رائدة في مجال توريد المستلزمات المكتبية والتقنية والخدمات البنكية. نسعى دائماً لتقديم أفضل تجربة تسوق لعملائنا من خلال منتجات متميزة وخدمة عملاء احترافية.",
                "FriendShip Trading and General Agencies is a leading company in supplying office supplies, technology products, and banking services. We always strive to provide the best shopping experience through premium products and professional customer service."
              )}
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: t("رؤيتنا", "Our Vision"), body: t("أن نكون الخيار الأول لتوريد الاحتياجات المكتبية والتقنية", "To be the first choice for office and tech supplies") },
                { title: t("رسالتنا", "Our Mission"), body: t("تقديم منتجات عالية الجودة بأسعار مناسبة مع ضمان رضا العميل", "Delivering quality products at fair prices while ensuring customer satisfaction") },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-2xl border-2 border-border hover:border-primary/30 transition-colors" style={{ background: "linear-gradient(135deg, #ffffff, #f5f8ff)" }}>
                  <div className="font-bold mb-2 text-primary">{item.title}</div>
                  <p className="text-muted-foreground" style={{ fontSize: "13px" }}>{item.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-image-frame min-h-[280px] sm:min-h-[340px]">
            <img src={heroImage2} alt={t("مكتب شركة الصداقة", "FriendShip office")} className="w-full h-full object-cover" style={{ minHeight: "340px" }} />
          </div>
        </div>
        {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-yellow-200   to-blue-300 hover:shadow-lg transition">
              <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2"> {t("جودة عالية", "High quality")}</h3>
              <p className="text-black-600">{t("نوفر الطلبيات بجودة  وضمانة عالية ", "We provide orders with high quality and excellent warranty ")}</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-yellow-200   to-blue-300 hover:shadow-lg transition">
              <div className="bg-yellow-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t("خدمة ممتازة", "Excellent Service")}</h3>
              <p className="text-balck-600">{t("نحن نهتم بكل تفاصيل طلبك", "We care about every detail of your order")}</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-yellow-200   to-blue-300 hover:shadow-lg transition">
              <div className="bg-yellow-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t("خدمة الطلبيات", "Order Service")}</h3>
              <p className="text-black-600">{t("نوفر جميع طلبيات البنوك والشركات", "We provide orders for all banks and companies")}</p>
            </div>
          </div>
        </div>
      </section>
      </section>
      

      {/* Sections */}
      <section ref={sectionsRef} style={{ background: "linear-gradient(180deg, #EDF1FB 0%, #E4EAF8 100%)" }} className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-block px-3 py-1 rounded-full mb-3 text-sm font-semibold" style={{ background: "rgba(13,30,64,0.08)", color: "var(--primary)" }}>
              {t("أقسامنا", "Our Sections")}
            </div>
            <h2 style={{ fontSize: "32px", fontWeight: 800, color: "var(--primary)" }}>
              {t("تصفح الأقسام الرئيسية", "Browse Our Main Sections")}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCurrentPage(`cat_${cat.id}`)}
                className="soft-card w-full p-6 sm:p-8 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 group-hover:opacity-10 transition-opacity" style={{ background: `radial-gradient(circle, #0D1E40, transparent)`, transform: "translate(20%, -30%)" }} />
                <div className="mx-auto mb-4" style={{ fontSize: "52px" }}>{cat.icon}</div>
                <h3 style={{ fontSize: "22px", fontWeight: 800, color: "var(--primary)", marginBottom: "8px" }}>
                  {isRtl ? cat.nameAr : cat.nameEn}
                </h3>
                <p className="text-muted-foreground mb-4 max-w-xs" style={{ fontSize: "14px", lineHeight: 1.7 }}>
                  {isRtl ? cat.descAr : cat.descEn}
                </p>
                <div className="flex items-center justify-center gap-1 font-semibold" style={{ color: "var(--accent)", fontSize: "14px" }}>
                  {t("تصفح المنتجات", "Browse Products")}
                  {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Purchase from Quotation CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="rounded-[28px] overflow-hidden" style={{ background: "linear-gradient(135deg, #0D1E40 0%, #1E3A6E 100%)" }}>
          <div className="px-5 sm:px-8 py-8 sm:py-10 flex flex-col md:flex-row items-center gap-6 text-white">
            <div className="text-5xl flex-shrink-0">📋</div>
            <div className={`flex-1 ${isRtl ? "text-right" : "text-left"}`}>
              <h3 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "6px" }}>
                {t("تحويل عرض السعر إلى طلب شراء", "Convert Quotation to Purchase Order")}
              </h3>
              <p style={{ opacity: 0.75, fontSize: "15px" }}>
                {t("لديك عرض سعر سابق؟ أدخل رقمه مباشرة واستكمل إجراءات الشراء", "Have an existing quotation? Enter its number and complete your purchase")}
              </p>
            </div>
            <button
              onClick={() => setCurrentPage("quotation_purchase")}
              className="btn-primary w-full md:w-auto flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #D4A820, #F0C040)", color: "#0D1E40", fontSize: "15px" }}
            >
              {t("طلب شراء من عرض سعر", "Purchase from Quotation")}
            </button>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 rounded-full mb-3 text-sm font-semibold" style={{ background: "rgba(196,154,32,0.12)", color: "#A07A10" }}>
            {t("المنتجات المميزة", "Featured Products")}
          </div>
          <h2 style={{ fontSize: "32px", fontWeight: 800, color: "var(--primary)" }}>
            {t("اختياراتنا المميزة", "Our Featured Picks")}
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map(p => {
            const cat = categories.find(c => c.id === p.category);
            return (
              <div key={p.id} className="soft-card overflow-hidden hover:-translate-y-1 transition-all duration-300 group">
                <div className="image-card" style={{ height: "190px" }}>
                  <img src={p.image} alt={isRtl ? p.nameAr : p.nameEn} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span style={{ fontSize: "14px" }}>{cat?.icon}</span>
                    <span className="text-muted-foreground" style={{ fontSize: "12px" }}>{isRtl ? cat?.nameAr : cat?.nameEn}</span>
                  </div>
                  <h4 style={{ fontWeight: 700, color: "var(--foreground)", marginBottom: "12px", fontSize: "15px" }}>
                    {isRtl ? p.nameAr : p.nameEn}
                  </h4>
                  <div className="flex items-center justify-between">
                    <span style={{ fontWeight: 800, fontSize: "20px", color: "var(--primary)" }}>
                      {currency}{p.price.toFixed(2)}
                    </span>
                    <button
                      onClick={() => {
                        addToCart(p, 1);
                        setAddedProductId(p.id);
                        window.setTimeout(() => setAddedProductId(null), 1400);
                      }}
                      className={`btn-primary px-4 py-2 text-sm ${addedProductId === p.id ? "btn-success" : ""}`}
                      style={addedProductId === p.id ? {} : { background: "linear-gradient(135deg, #0D1E40, #1E3A6E)" }}
                    >
                      {t("أضف", "Add")}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Reviews */}
      <section style={{ background: "linear-gradient(180deg, #E4EAF8 0%, #EDF1FB 100%)" }} className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-block px-3 py-1 rounded-full mb-3 text-sm font-semibold" style={{ background: "rgba(13,30,64,0.08)", color: "var(--primary)" }}>
              {t("آراء العملاء", "Customer Reviews")}
            </div>
            <h2 style={{ fontSize: "32px", fontWeight: 800, color: "var(--primary)" }}>
              {t("ماذا يقول عملاؤنا", "What Our Clients Say")}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {visibleReviews.slice(0, 6).map(r => (
              <div key={r.id} className="bg-white p-6 rounded-3xl shadow-sm border border-border relative">
                <div className="absolute top-5 right-5 text-4xl opacity-10 font-serif">"</div>
                <div className="flex gap-1 mb-3">
                  {[1,2,3,4,5].map(s => <Star key={s} size={16} className={s <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200 fill-gray-200"} />)}
                </div>
                <p className="text-muted-foreground leading-relaxed mb-5" style={{ fontSize: "14px" }}>{r.comment}</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold" style={{ background: "linear-gradient(135deg, #0D1E40, #1E3A6E)", fontSize: "14px" }}>
                    {r.customerName[0]}
                  </div>
                  <span style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "14px" }}>{r.customerName}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Review form */}
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-border">
            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--primary)", marginBottom: "20px" }}>
              {t("أضف تقييمك", "Add Your Review")}
            </h3>
            {formSuccess ? (
              <div className="text-center py-8 text-green-600 font-bold text-lg">✓ {t("شكراً لتقييمك!", "Thank you for your review!")}</div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <input required placeholder={t("اسمك", "Your Name")} value={reviewForm.name} onChange={e => setReviewForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground text-sm">{t("التقييم:", "Rating:")}</span>
                  {[1,2,3,4,5].map(s => (
                    <button type="button" key={s} onClick={() => setReviewForm(f => ({ ...f, rating: s }))}>
                      <Star size={26} className={s <= reviewForm.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 fill-gray-300"} />
                    </button>
                  ))}
                </div>
                <select value={reviewForm.type} onChange={e => setReviewForm(f => ({ ...f, type: e.target.value as any }))} className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="review">{t("تقييم", "Review")}</option>
                  <option value="complaint">{t("شكوى", "Complaint")}</option>
                  <option value="suggestion">{t("اقتراح", "Suggestion")}</option>
                </select>
                <textarea required rows={3} placeholder={t("اكتب تعليقك...", "Write your comment...")} value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
                <button type="submit" className="flex items-center gap-2 px-7 py-3 rounded-xl text-white font-bold transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg, #0D1E40, #1E3A6E)" }}>
                  <Send size={16} /> {t("إرسال التقييم", "Submit Review")}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Contact & Complaints */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-border">
            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--primary)", marginBottom: "6px" }}>{t("الشكاوى والاقتراحات", "Complaints & Suggestions")}</h3>
            <p className="text-muted-foreground mb-6 text-sm">{t("رأيك يهمنا لتحسين خدماتنا", "Your feedback helps us improve")}</p>
            {complaintSuccess ? (
              <div className="text-center py-8 text-green-600 font-bold text-lg">✓ {t("تم استلام رسالتك، شكراً!", "Message received, thank you!")}</div>
            ) : (
              <form onSubmit={handleComplaintSubmit} className="space-y-4">
                <input required placeholder={t("اسمك", "Your Name")} value={complaintForm.name} onChange={e => setComplaintForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <textarea required rows={4} placeholder={t("اكتب شكواك أو اقتراحك...", "Your complaint or suggestion...")} value={complaintForm.message} onChange={e => setComplaintForm(f => ({ ...f, message: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
                <button type="submit" className="flex items-center gap-2 px-7 py-3 rounded-xl text-white font-bold transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg, #C49A20, #D4A820)" }}>
                  <Send size={16} /> {t("إرسال", "Send")}
                </button>
              </form>
            )}
          </div>

          <div className="space-y-5">
            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--primary)" }}>{t("معلومات التواصل", "Contact Information")}</h3>
            {[
              { icon: <Phone size={20} />, label: t("الهاتف", "Phone"), value: isRtl ? "٠٩٦٣ ٠٣١ ٧٧٥ ٩٦٧+" : "+967 775 031 963", grad: "from-blue-600 to-blue-800", action: handlePhoneCall, isPhone: true },
              { icon: <Mail size={20} />, label: t("البريد الإلكتروني", "Email"), value: "info@friendship.sd", grad: "from-purple-600 to-purple-800", action: () => window.location.href = "mailto:info@friendship.sd", isPhone: false },
              { icon: <MapPin size={20} />, label: t("العنوان", "Address"), value: t("اليمن , شعوب , شارع صخر ", "Yemen, Shpub , Sakher St"), grad: "from-green-600 to-green-800", action: () => window.open("https://maps.google.com/?q=Yemen+Shpub+Sakher+St", "_blank"), isPhone: false },
            ].map((c, i) => (
              <button key={i} type="button" onClick={c.action} className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-border hover:shadow-md transition-shadow w-full text-right">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.grad} flex items-center justify-center text-white flex-shrink-0`}>
                  {c.icon}
                </div>
                <div className="text-right flex-1">
                  <div className="text-muted-foreground text-xs mb-0.5">{c.label}</div>
                  <div style={{ fontWeight: 700, color: "var(--foreground)" }}>{c.value}</div>
                </div>
              </button>
            ))}
            <div className="p-5 rounded-2xl border-2 border-primary/15" style={{ background: "linear-gradient(135deg, #f5f8ff, #edf1fb)" }}>
              <div style={{ fontWeight: 700, color: "var(--primary)", marginBottom: "4px" }}>{t("ساعات العمل", "Working Hours")}</div>
              <div className="text-muted-foreground text-sm">{t("السبت – الخميس: 8:00 ص – 8:00 م", "Saturday – Thursday: 8:00 AM – 8:00 PM")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "linear-gradient(135deg, #0A1628 0%, #0D1E40 100%)" }} className="text-white py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CompanyLogo size="sm" />
              <div>
                <div style={{ fontFamily: "Cairo, sans-serif", fontWeight: 800, fontSize: "16px" }}>
                  {t("شركة الصداقة", "FriendShip Company")}
                </div>
                <div style={{ fontSize: "12px", opacity: 0.6 }}>
                  {t("للتجارة والتوكيلات العامة", "Trading & General Agencies")}
                </div>
              </div>
            </div>
            <div style={{ fontSize: "14px", opacity: 0.5 }}>
              © 2026 {t("جميع الحقوق محفوظة", "All rights reserved")}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
