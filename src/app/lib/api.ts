import axios from "axios";
import type { Settings } from "../context/AppContext";
import type { Order } from "../context/AppContext";

const envApiUrl = (import.meta as any).env?.VITE_API_URL ?? "";
const API_URL = envApiUrl;

export async function createOrder(payload: ApiOrderPayload): Promise<Order> {
  const data = await fetchJson<ApiOrder | { order: ApiOrder }>("/api/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const order = unwrap<ApiOrder>(data, "order");
  return normalizeOrder(order);
}

// نوع بيانات تسجيل الدخول
export interface LoginPayload {
  username: string;
  password: string;
}

// نوع الاستجابة من السيرفر
export interface LoginResponse {
  token: string;
  userId: string;
  role?: string;
}

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  const data = await fetchJson<LoginResponse>("/api/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data;
}

// جلب الموظفين
export async function getStaff(): Promise<ApiStaffUser[]> {
  const data = await fetchJson<ApiStaffUser[]>("/api/staff");
  return data;
}

// جلب المراجعات
export async function getReviews(): Promise<ApiReview[]> {
  const data = await fetchJson<ApiReview[]>("/api/reviews");
  return data;
}
export async function getCategories(): Promise<ApiCategory[]> {
  const data = await fetchJson<ApiCategory[]>('/api/categories');
  return data;
}
export async function getProducts(): Promise<ApiProduct[]> {
  const data = await fetchJson<ApiProduct[]>("/api/products");
  return data;
}

export async function getOrders(): Promise<Order[]> {
  const data = await fetchJson<ApiOrder[]>('/api/orders');
  return data.map(order => normalizeOrder(order));
}

export async function getEmployees(): Promise<ApiEmployee[]> {
  const data = await fetchJson<ApiEmployee[]>('/api/employees');
  return data;
}

export async function getBanks(): Promise<ApiBank[]> {
  const data = await fetchJson<ApiBank[]>("/api/banks");
  return data;
}

export type ApiProduct = {
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
};

export type ApiBank = {
  id: string;
  nameAr: string;
  nameEn: string;
  accountNumber: string;
  active: boolean;
};

export type ApiEmployee = {
  id: string;
  nameAr: string;
  nameEn: string;
  phone: string;
  active: boolean;
};

export type ApiStaffUser = {
  id: string;
  username: string;
  password: string;
  nameAr: string;
  nameEn: string;
  role: "admin" | "customer_service" | "warehouse" | "delivery";
  active: boolean;
};

export type ApiReview = {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  type: "review" | "complaint" | "suggestion";
  hidden: boolean;
  reply?: string | null;
  createdAt: string;
};

export type ApiOrderItem = {
  product: ApiProduct;
  productId?: string;
  quantity: number;
  price: number;
};

export type ApiOrder = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  total: number;
  paymentMethod: "cash" | "bank_transfer";
  bankId?: string;
  transferRef?: string;
  status: "pending" | "customer_service" | "payment_pending" | "warehouse" | "ready" | "delivering" | "delivered" | "closed";
  deliveryEmployeeId?: string;
  createdAt: string;
  isQuotation: boolean;
  quotationValidity?: number;
  items: ApiOrderItem[];
};

export type ApiCategory = {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  descAr: string;
  descEn: string;
};

// Use `any` here to avoid TS issues if Vite types are not picked up correctly.
// Default to an empty string so browser requests use the same origin
// and Vite's dev server proxy (configured in `vite.config.ts`) can forward
// `/api` calls to the backend. Set `VITE_API_URL` to override.
const apiBase =
  envApiUrl || "https://friendship-backend-1cuf.onrender.com";

console.log("API BASE =", apiBase);
async function fetchJson<T>(url: string, opts: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiBase}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
    ...opts,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed: ${response.status}`);
  }

  return await response.json();
}

function unwrap<T>(data: T | { [key: string]: unknown }, key: string): T {
  if (data && typeof data === "object" && key in data) {
    return (data as Record<string, T>)[key];
  }
  return data as T;
}

export function parseDate<T extends { createdAt: string }>(item: T): T & { createdAt: Date } {
  return { ...item, createdAt: new Date(item.createdAt) } as T & { createdAt: Date };
}

export type ApiOrderPayload = {
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  deliveryAddress: string;
  total: number;
  paymentMethod: "cash" | "bank_transfer";
  bankId?: string | null;
  transferRef?: string | null;
  status: "pending" | "customer_service" | "payment_pending" | "warehouse" | "ready" | "delivering" | "delivered" | "closed";
  deliveryEmployeeId?: string | null;
  isQuotation: boolean;
  quotationValidity?: number | null;
  items: ApiOrderItem[];
};

export function normalizeOrder(order: ApiOrder): Order {
  return parseDate({
    ...order,
    customerEmail: order.customerEmail ?? undefined,
    bankId: order.bankId ?? undefined,
    transferRef: order.transferRef ?? undefined,
    deliveryEmployeeId: order.deliveryEmployeeId ?? undefined,
    quotationValidity: order.quotationValidity ?? undefined,
  }) as Order;
}

// ✅ تعديل updateOrder ليعيد Order صحيح
export async function updateOrder(id: string, payload: Partial<ApiOrder>): Promise<Order> {
  const data = await fetchJson<ApiOrder>(`/api/orders/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return normalizeOrder(data);
}

// باقي الدوال كما هي (getProducts, createOrder, updateProduct, إلخ)…

export async function createProduct(
  product: Omit<ApiProduct, "id">
): Promise<ApiProduct> {
  const data = await fetchJson<ApiProduct | { product: ApiProduct }>("/api/products", {
    method: "POST",
    body: JSON.stringify(product),
  });
  return unwrap<ApiProduct>(data, "product");
}

export async function updateProduct(
  id: string,
  product: Omit<ApiProduct, "id">
): Promise<ApiProduct> {
  const data = await fetchJson<ApiProduct | { product: ApiProduct }>(
    `/api/products/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(product),
    }
  );
  return unwrap<ApiProduct>(data, "product");
}

export async function deleteProduct(id: string) {
  return await fetchJson<{ success: boolean }>(`/api/products/${id}`, {
    method: "DELETE",
  });
}

export async function createBank(bank: Omit<ApiBank, "id">) {
  const data = await fetchJson<ApiBank | { bank: ApiBank }>("/api/banks", {
    method: "POST",
    body: JSON.stringify(bank),
  });
  return unwrap<ApiBank>(data, "bank");
}

export async function updateBank(id: string, bank: Omit<ApiBank, "id">) {
  const data = await fetchJson<ApiBank | { bank: ApiBank }>(`/api/banks/${id}`, {
    method: "PUT",
    body: JSON.stringify(bank),
  });
  return unwrap<ApiBank>(data, "bank");
}

export async function deleteBank(id: string) {
  return await fetchJson<{ success: boolean }>(`/api/banks/${id}`, {
    method: "DELETE",
  });
}

export async function createEmployee(employee: Omit<ApiEmployee, "id">) {
  const data = await fetchJson<ApiEmployee | { employee: ApiEmployee }>("/api/employees", {
    method: "POST",
    body: JSON.stringify(employee),
  });
  return unwrap<ApiEmployee>(data, "employee");
}

export async function updateEmployee(id: string, employee: Omit<ApiEmployee, "id">) {
  const data = await fetchJson<ApiEmployee | { employee: ApiEmployee }>(`/api/employees/${id}`, {
    method: "PUT",
    body: JSON.stringify(employee),
  });
  return unwrap<ApiEmployee>(data, "employee");
}

export async function deleteEmployee(id: string) {
  return await fetchJson<{ success: boolean }>(`/api/employees/${id}`, {
    method: "DELETE",
  });
}

export async function createStaffUser(user: Omit<ApiStaffUser, "id">) {
  const data = await fetchJson<ApiStaffUser | { staff: ApiStaffUser }>("/api/staff", {
    method: "POST",
    body: JSON.stringify(user),
  });
  return unwrap<ApiStaffUser>(data, "staff");
}

export async function updateStaffUser(id: string, user: Omit<ApiStaffUser, "id">) {
  const data = await fetchJson<ApiStaffUser | { staff: ApiStaffUser }>(`/api/staff/${id}`, {
    method: "PUT",
    body: JSON.stringify(user),
  });
  return unwrap<ApiStaffUser>(data, "staff");
}

export async function deleteStaffUser(id: string) {
  return await fetchJson<{ success: boolean }>(`/api/staff/${id}`, {
    method: "DELETE",
  });
}

export async function updateReview(id: string, review: Omit<ApiReview, "id" | "createdAt">) {
  const data = await fetchJson<ApiReview | { review: ApiReview }>(`/api/reviews/${id}`, {
    method: "PUT",
    body: JSON.stringify(review),
  });
  return parseDate(unwrap<ApiReview>(data, "review"));
}

export async function createReview(review: Omit<ApiReview, "id" | "createdAt" | "hidden">) {
  const data = await fetchJson<ApiReview | { review: ApiReview }>("/api/reviews", {
    method: "POST",
    body: JSON.stringify(review),
  });
  return parseDate(unwrap<ApiReview>(data, "review"));
}
// جلب الإعدادات من السيرفر
export async function getSettings(): Promise<Settings> {
  const res = await axios.get(`${API_URL}/api/settings`);
  return res.data;
}

// تحديث الإعدادات في السيرفر
export async function updateSettings(settings: Settings): Promise<Settings> {
  const res = await axios.put(`${API_URL}/api/settings`, settings);
  return res.data;
}
export async function createCategory(category: Omit<ApiCategory, "id">) {
  const data = await fetchJson<ApiCategory | { category: ApiCategory }>("/api/categories", {
    method: "POST",
    body: JSON.stringify(category),
  });
  return unwrap<ApiCategory>(data, "category");
}

export async function updateCategory(id: string, category: Omit<ApiCategory, "id">) {
  const data = await fetchJson<ApiCategory | { category: ApiCategory }>(`/api/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(category),
  });
  return unwrap<ApiCategory>(data, "category");
}

export async function deleteCategory(id: string) {
  return await fetchJson<{ success: boolean }>(`/api/categories/${id}`, {
    method: "DELETE",
  });
}
