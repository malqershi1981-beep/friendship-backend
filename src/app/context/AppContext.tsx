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
  ];

const initialProducts: Product[] = [
  
];

const initialBanks: Bank[] = [
  
];

const initialEmployees: DeliveryEmployee[] = [
  
];

const initialReviews: Review[] = [
  
];

const initialStaff: StaffUser[] = [
  
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
