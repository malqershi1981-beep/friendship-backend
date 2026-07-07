import { useState } from "react";
import { Lock, User, LogIn } from "lucide-react";
import { useApp } from "../context/AppContext";

export function LoginPage() {
  const { lang, t, login, setCurrentPage, currentUser } = useApp();
  const isRtl = lang === "ar";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  if (currentUser) {
    setCurrentPage("portal");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = login(username, password);
    if (ok) setCurrentPage("portal");
    else { setError(true); setTimeout(() => setError(false), 3000); }
  };

  const demoAccounts = [
    { username: "admin", password: "admin1234", role: t("مدير النظام", "Admin") },
    { username: "cs1", password: "cs123", role: t("خدمة العملاء", "Customer Service") },
    { username: "wh1", password: "wh123", role: t("المخازن", "Warehouse") },
    { username: "del1", password: "del123", role: t("التوصيل", "Delivery") },
    { username: "kh", password: "k123", role: t("التوصيل", "Delivery") },
  ];

  return (
    <div dir={isRtl ? "rtl" : "ltr"} style={{ fontFamily: isRtl ? "Cairo, sans-serif" : "Inter, sans-serif" }} className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <Lock size={36} className="text-white" />
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--primary)" }}>{t("دخول الموظفين", "Staff Login")}</h1>
          <p className="text-muted-foreground mt-2">{t("شركة الصداقة للتجارة والتوكيلات العامة", "FriendShip Trading & General Agencies")}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-border p-8 mb-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-2" style={{ fontWeight: 600, fontSize: "14px" }}>{t("اسم المستخدم", "Username")}</label>
              <div className="relative">
                <User size={18} className="absolute top-1/2 -translate-y-1/2 text-muted-foreground" style={{ [isRtl ? "right" : "left"]: "14px" }} />
                <input
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  style={{ [isRtl ? "paddingRight" : "paddingLeft"]: "44px", paddingLeft: isRtl ? "16px" : "44px", paddingRight: isRtl ? "44px" : "16px" }}
                  autoComplete="username"
                />
              </div>
            </div>
            <div>
              <label className="block mb-2" style={{ fontWeight: 600, fontSize: "14px" }}>{t("كلمة المرور", "Password")}</label>
              <div className="relative">
                <Lock size={18} className="absolute top-1/2 -translate-y-1/2 text-muted-foreground" style={{ [isRtl ? "right" : "left"]: "14px" }} />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  style={{ [isRtl ? "paddingRight" : "paddingLeft"]: "44px", paddingLeft: isRtl ? "16px" : "44px", paddingRight: isRtl ? "44px" : "16px" }}
                  autoComplete="current-password"
                />
              </div>
            </div>
            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-50 text-destructive border border-red-200" style={{ fontSize: "14px", fontWeight: 600 }}>
                {t("اسم المستخدم أو كلمة المرور غير صحيحة", "Invalid username or password")}
              </div>
            )}
            <button type="submit" className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity" style={{ fontWeight: 700, fontSize: "16px" }}>
              <LogIn size={20} />
              {t("تسجيل الدخول", "Sign In")}
            </button>
          </form>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-border p-6"></div>       
      </div>
    </div>
  );
}
