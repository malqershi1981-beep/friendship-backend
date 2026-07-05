import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { getCategories, getProducts, getOrders, getBanks, getEmployees, getStaff, getReviews } from "../lib/api";
import { getSettings } from "../lib/api";

export type Language = "ar" | "en";
export type UserRole = "admin" | "customer_service" | "warehouse" | "delivery" | null;
export type OrderStatus = "pending" | "customer_service" | "payment_pending" | "warehouse" | "ready" | "delivering" | "delivered" | "closed" | "rejected";
export type PaymentMethod = "cash" | "bank_transfer";

export interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  descAr: string;
  descEn: string;
}

export interface Product {
  id: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  available: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Bank {
  id: string;
  nameAr: string;
  nameEn: string;
  accountNumber: string;
  active: boolean;
}

export interface DeliveryEmployee {
  id: string;
  nameAr: string;
  nameEn: string;
  phone: string;
  active: boolean;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  items: CartItem[];
  total: number;
  paymentMethod: PaymentMethod;
  bankId?: string;
  transferRef?: string;
  status: OrderStatus;
  deliveryEmployeeId?: string;
  createdAt: Date;
  isQuotation?: boolean;
  quotationValidity?: number;
  deliveredAt?: string;
}

export interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  type: "review" | "complaint" | "suggestion";
  hidden: boolean;
  reply?: string;
  createdAt: Date;
}
export interface Settings {
  quotationValidityDays: number;
  // ممكن تضيف إعدادات أخرى هنا
}

const defaultSettings: Settings = {
  quotationValidityDays: 3,
};

export interface StaffUser {
  id: string;
  username: string;
  password: string;
  nameAr: string;
  nameEn: string;
  role: UserRole;
  active: boolean;
}

const initialCategories: Category[] = [
  { id: "stationery", nameAr: "القرطاسية", nameEn: "Stationery", icon: "📝", descAr: "أدوات مكتبية متنوعة وعالية الجودة", descEn: "Diverse high-quality office supplies" },
  { id: "computers", nameAr: "الكمبيوترات ومستلزماتها", nameEn: "Computers & Accessories", icon: "💻", descAr: "أحدث الأجهزة والمستلزمات الإلكترونية", descEn: "Latest devices and electronics" },
  { id: "banking", nameAr: "خدمات البنوك", nameEn: "Banking Services", icon: "🏦", descAr: "خدمات مالية وبنكية متكاملة", descEn: "Comprehensive banking & financial services" },
];

const initialProducts: Product[] = [
  { id: "p1", nameAr: "دفتر أوراق A4", nameEn: "A4 Notebook", descAr: "دفتر مسطر عالي الجودة", descEn: "High quality ruled notebook", price: 2.50, category: "stationery", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop&auto=format", stock: 500, available: true },
  { id: "p2", nameAr: "أقلام حبر جاف (علبة 12)", nameEn: "Ballpoint Pens (Box 12)", descAr: "أقلام حبر جاف زرقاء عالية الجودة", descEn: "Blue ballpoint pens, pack of 12", price: 3.00, category: "stationery", image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400&h=300&fit=crop&auto=format", stock: 1000, available: true },
  { id: "p3", nameAr: "ورق طباعة A4 (رزمة)", nameEn: "A4 Printing Paper (Ream)", descAr: "ورق طباعة أبيض 80 جرام", descEn: "White printing paper 80gsm", price: 8.00, category: "stationery", image: "https://images.unsplash.com/photo-1568667256549-094345857637?w=400&h=300&fit=crop&auto=format", stock: 200, available: true },
  { id: "p4", nameAr: "ملفات تجميع", nameEn: "Filing Folders", descAr: "ملفات بلاستيكية متعددة الألوان", descEn: "Colorful plastic folders", price: 1.50, category: "stationery", image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop&auto=format", stock: 300, available: true },
  { id: "p5", nameAr: "لاب توب أعمال", nameEn: "Business Laptop", descAr: "لاب توب للأعمال بمعالج i7 وذاكرة 16GB", descEn: "Business laptop, i7 processor, 16GB RAM", price: 850.00, category: "computers", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop&auto=format", stock: 15, available: true },
  { id: "p6", nameAr: "طابعة ليزر", nameEn: "Laser Printer", descAr: "طابعة ليزر أحادية عالية السرعة", descEn: "High-speed monochrome laser printer", price: 320.00, category: "computers", image: "https://images.unsplash.com/photo-1612815292170-e0ca0e4ccf38?w=400&h=300&fit=crop&auto=format", stock: 8, available: true },
  { id: "p7", nameAr: "شاشة كمبيوتر 24\"", nameEn: "24\" Monitor", descAr: "شاشة FHD مناسبة للمكاتب", descEn: "FHD office monitor", price: 180.00, category: "computers", image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=300&fit=crop&auto=format", stock: 20, available: true },
  { id: "p8", nameAr: "ماوس ولوحة مفاتيح لاسلكي", nameEn: "Wireless Mouse & Keyboard", descAr: "طقم ماوس ولوحة مفاتيح لاسلكية", descEn: "Wireless mouse and keyboard combo", price: 45.00, category: "computers", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop&auto=format", stock: 50, available: true },
  { id: "p9", nameAr: "خدمة تحصيل فواتير", nameEn: "Bill Collection Service", descAr: "خدمة تحصيل وسداد فواتير البنوك", descEn: "Bank bill collection and payment service", price: 5.00, category: "banking", image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop&auto=format", stock: 9999, available: true },
  { id: "p10", nameAr: "خدمة تحويل مالي", nameEn: "Money Transfer Service", descAr: "خدمة التحويل المالي عبر البنوك", descEn: "Bank money transfer service", price: 10.00, category: "banking", image: "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=400&h=300&fit=crop&auto=format", stock: 9999, available: true },
];

const initialBanks: Bank[] = [
  { id: "b1", nameAr: "بنك الخرطوم", nameEn: "Bank of Khartoum", accountNumber: "1234567890123", active: true },
  { id: "b2", nameAr: "البنك الأهلي السوداني", nameEn: "National Bank of Sudan", accountNumber: "9876543210987", active: true },
  { id: "b3", nameAr: "بنك فيصل الإسلامي", nameEn: "Faisal Islamic Bank", accountNumber: "1122334455667", active: false },
];

const initialEmployees: DeliveryEmployee[] = [
  { id: "e1", nameAr: "أحمد محمد", nameEn: "Ahmed Mohammed", phone: "0912345678", active: true },
  { id: "e2", nameAr: "خالد عمر", nameEn: "Khaled Omar", phone: "0923456789", active: true },
  { id: "e3", nameAr: "يوسف إبراهيم", nameEn: "Yousef Ibrahim", phone: "0934567890", active: false },
];

const initialReviews: Review[] = [
  { id: "r1", customerName: "محمد علي", rating: 5, comment: "خدمة ممتازة وتوصيل سريع جداً", type: "review", hidden: false, createdAt: new Date("2026-05-10") },
  { id: "r2", customerName: "فاطمة حسن", rating: 4, comment: "منتجات ذات جودة عالية وأسعار مناسبة", type: "review", hidden: false, createdAt: new Date("2026-05-15") },
  { id: "r3", customerName: "عمر الشيخ", rating: 3, comment: "التوصيل تأخر قليلاً لكن المنتجات ممتازة", type: "complaint", hidden: false, createdAt: new Date("2026-05-20") },
  { id: "r4", customerName: "سارة أحمد", rating: 5, comment: "أتمنى إضافة المزيد من منتجات الكمبيوتر", type: "suggestion", hidden: false, createdAt: new Date("2026-06-01") },
];

const initialStaff: StaffUser[] = [
  { id: "s1", username: "admin", password: "admin123", nameAr: "مدير النظام", nameEn: "System Admin", role: "admin", active: true },
  { id: "s2", username: "cs1", password: "cs123", nameAr: "نور محمد", nameEn: "Nour Mohammed", role: "customer_service", active: true },
  { id: "s3", username: "wh1", password: "wh123", nameAr: "حسام خالد", nameEn: "Hossam Khaled", role: "warehouse", active: true },
  { id: "s4", username: "del1", password: "del123", nameAr: "أحمد محمد", nameEn: "Ahmed Mohammed", role: "delivery", active: true },
];

interface AppContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (ar: string, en: string) => string;
  currency: string;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  banks: Bank[];
  setBanks: React.Dispatch<React.SetStateAction<Bank[]>>;
  employees: DeliveryEmployee[];
  setEmployees: React.Dispatch<React.SetStateAction<DeliveryEmployee[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  reviews: Review[];
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
  staff: StaffUser[];
  setStaff: React.Dispatch<React.SetStateAction<StaffUser[]>>;
  cart: CartItem[];
  addToCart: (product: Product, qty: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  cartTotal: number;
  currentUser: StaffUser | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  currentPage: string;
  setCurrentPage: (p: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  trackOrderId: string;
  setTrackOrderId: (id: string) => void;
  newOrdersCount: number;
  setNewOrdersCount: (n: number) => void;
  quotationToPurchaseId: string;
  setQuotationToPurchaseId: (id: string) => void;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}


export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const data = await getSettings();
        setSettings(data);
      } catch (error) {
        console.error("خطأ في جلب الإعدادات:", error);
      }
    }
    fetchSettings();
  }, []);
  
  const [lang, setLang] = useState<Language>("en");
  useEffect(() => {
    // تحديد اللغة من المتصفح أو الجهاز
    const userLang = navigator.language || navigator.languages[0] || "en";
    if (userLang.startsWith("ar")) {
      setLang("ar");
    } else {
      setLang("en");
    }
  }, []);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [banks, setBanks] = useState<Bank[]>(initialBanks);
  const [employees, setEmployees] = useState<DeliveryEmployee[]>(initialEmployees);
  const [orders, setOrders] = useState<Order[]>([]);
  const [newOrdersCount, setNewOrdersCount] = useState<number>(0);
  const lastOrderIdsRef = useRef<Set<string>>(new Set());
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [staff, setStaff] = useState<StaffUser[]>(initialStaff);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(null);
  // Initialize currentPage from URL `?page=` or hash fallback so refresh preserves page
  const getInitialPage = () => {
    try {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const p = params.get("page");
        if (p) return p;
        // hash fallback: #track or #cart
        if (window.location.hash) {
          const h = window.location.hash.replace(/^#/, "");
          if (h) return h;
        }
      }
    } catch (e) {}
    return "home";
  };
  const [currentPage, setCurrentPageState] = useState<string>(getInitialPage);
  // wrap setter so navigation always scrolls to top on change
  const setCurrentPage = (p: string) => {
    setCurrentPageState(p);
    if (typeof window !== "undefined") {
      try {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (e) {
        window.scrollTo(0, 0);
      }
    }
  };
  const [selectedCategory, setSelectedCategory] = useState("all");
  // Initialize trackOrderId from URL if present
  const getInitialTrack = () => {
    try {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const o = params.get("order");
        if (o) return o;
      }
    } catch (e) {}
    return "";
  };
  const [trackOrderId, setTrackOrderId] = useState<string>(getInitialTrack);

  // Persist page and trackOrderId to URL so reload keeps the view
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      if (currentPage) params.set("page", currentPage); else params.delete("page");
      if (trackOrderId) params.set("order", trackOrderId); else params.delete("order");
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, "", newUrl);
    } catch (e) {}
  }, [currentPage, trackOrderId]);
  const [quotationToPurchaseId, setQuotationToPurchaseId] = useState("");

  const currency = "$";

  const t = useCallback((ar: string, en: string) => lang === "ar" ? ar : en, [lang]);

  const addToCart = useCallback((product: Product, qty: number) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i);
      return [...prev, { product, quantity: qty }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  }, []);

  const updateCartQty = useCallback((productId: string, qty: number) => {
    if (qty <= 0) { removeFromCart(productId); return; }
    setCart(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: qty } : i));
  }, [removeFromCart]);

  const clearCart = useCallback(() => setCart([]), []);

  const cartTotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const login = useCallback((username: string, password: string) => {
    const user = staff.find(s => s.username === username && s.password === password && s.active);
    if (user) { setCurrentUser(user); return true; }
    return false;
  }, [staff]);

  const logout = useCallback(() => { setCurrentUser(null); setCurrentPage("home"); }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const [categoriesData, productsData, ordersData, banksData, employeesData, reviewsData, staffData] = await Promise.all([
          getCategories(),
          getProducts(),
          getOrders(),
          getBanks(),
          getEmployees(),
          getReviews(),
          getStaff(),
        ]);

        setCategories(categoriesData);
        setProducts(productsData);
        setOrders(ordersData);
        // initialize lastOrderIds
        try {
          lastOrderIdsRef.current = new Set(ordersData.map(o => o.id));
        } catch (e) {}
        setBanks(banksData);
        setEmployees(employeesData);
        setReviews(reviewsData.map(r => ({ ...r, reply: r.reply ?? undefined, createdAt: new Date(r.createdAt) })));
        setStaff(staffData);
      } catch (error) {
        console.error("Failed to load initial app data:", error);
      }
    }
    loadData();
  }, []);

  // Poll orders periodically so pages like tracking update automatically
  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      try {
        const ordersData = await getOrders();
        if (!mounted) return;
        setOrders(ordersData);
        // detect new order IDs
        try {
          const prev = lastOrderIdsRef.current || new Set();
          const newOnes = ordersData.filter(o => !prev.has(o.id)).map(o => o.id);
          if (newOnes.length > 0) {
            setNewOrdersCount(prevCount => prevCount + newOnes.length);
            // add to known ids
            newOnes.forEach(id => prev.add(id));
            lastOrderIdsRef.current = prev;
          }
        } catch (e) {}
      } catch (e) {
        // ignore polling errors
      }
    };
    const id = setInterval(refresh, 5000);
    // initial refresh shortly after mount
    const t = setTimeout(refresh, 1000);
    return () => { mounted = false; clearInterval(id); clearTimeout(t); };
  }, []);

  return (
    <AppContext.Provider value={{
      lang, setLang, t, currency, settings , setSettings ,
      categories, setCategories,
      products, setProducts, banks, setBanks,
      employees, setEmployees, orders, setOrders, reviews, setReviews,
      staff, setStaff, cart, addToCart, removeFromCart, updateCartQty,
      clearCart, cartTotal, currentUser, login, logout,
      currentPage, setCurrentPage, selectedCategory, setSelectedCategory,
      trackOrderId, setTrackOrderId,
      newOrdersCount, setNewOrdersCount,
      quotationToPurchaseId, setQuotationToPurchaseId,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
