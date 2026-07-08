import express from "express";
import cors from "cors";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";


dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 4000;

const brevoApiKey = process.env.BREVO_API_KEY?.trim();
const senderFrom = process.env.EMAIL_FROM?.trim() || process.env.SMTP_USER?.trim() || "no-reply@localhost";

function parseSenderAddress(fromValue) {
  const match = fromValue?.match(/<([^>]+)>/);
  const email = match ? match[1] : fromValue || "no-reply@localhost";
  const name = fromValue && fromValue.includes("<")
    ? fromValue.slice(0, fromValue.indexOf("<")).trim() || "FriendShip Trading"
    : "FriendShip Trading";
  return { name, email };
}

const sender = parseSenderAddress(senderFrom);

async function sendEmailViaBrevo({ to, subject, text, html }) {
  if (!brevoApiKey) {
    throw new Error("BREVO_API_KEY is not configured");
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": brevoApiKey,
    },
    body: JSON.stringify({
      sender: {
        name: sender.name,
        email: sender.email,
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
      replyTo: {
        email: sender.email,
      },
    }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(JSON.stringify(result));
  }

  return result;
}

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

const dbPath = path.resolve(__dirname, "database.db");
const db = new Database(dbPath);
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quotationValidityDays INTEGER NOT NULL DEFAULT 3
  );
`);

db.exec(`
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  nameAr TEXT,
  nameEn TEXT,
  descAr TEXT,
  descEn TEXT,
  price REAL,
  category TEXT,
  image TEXT,
  stock INTEGER,
  available INTEGER
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  nameAr TEXT,
  nameEn TEXT,
  icon TEXT,
  descAr TEXT,
  descEn TEXT
);

CREATE TABLE IF NOT EXISTS banks (
  id TEXT PRIMARY KEY,
  nameAr TEXT,
  nameEn TEXT,
  accountNumber TEXT,
  active INTEGER
);

CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  nameAr TEXT,
  nameEn TEXT,
  phone TEXT,
  active INTEGER
);

CREATE TABLE IF NOT EXISTS staff (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE,
  password TEXT,
  nameAr TEXT,
  nameEn TEXT,
  role TEXT,
  active INTEGER
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  customerName TEXT,
  rating INTEGER,
  comment TEXT,
  type TEXT,
  hidden INTEGER,
  reply TEXT,
  createdAt TEXT
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customerName TEXT,
  customerPhone TEXT,
  customerEmail TEXT,
  deliveryAddress TEXT,
  total REAL,
  paymentMethod TEXT,
  bankId TEXT,
  transferRef TEXT,
  status TEXT,
  deliveryEmployeeId TEXT,
  createdAt TEXT,
  isQuotation INTEGER,
  quotationValidity INTEGER
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  orderId TEXT,
  productId TEXT,
  quantity INTEGER,
  price REAL
);
`);

function seedIfEmpty() {
  const prodCount = db.prepare("SELECT COUNT(*) AS cnt FROM products").get().cnt;
  const catCount = db.prepare("SELECT COUNT(*) AS cnt FROM categories").get().cnt;

  const categories = [
    { id: "stationery", nameAr: "القرطاسية", nameEn: "Stationery", icon: "📝", descAr: "أدوات مكتبية متنوعة وعالية الجودة", descEn: "Diverse high-quality office supplies" },
    { id: "computers", nameAr: "الكمبيوترات ومستلزماتها", nameEn: "Computers & Accessories", icon: "💻", descAr: "أحدث الأجهزة والمستلزمات الإلكترونية", descEn: "Latest devices and electronics" },
    { id: "banking", nameAr: "خدمات البنوك", nameEn: "Banking Services", icon: "🏦", descAr: "خدمات مالية وبنكية متكاملة", descEn: "Comprehensive banking & financial services" }
  ];

  const products = [
    { id: "p1", nameAr: "دفتر أوراق A4", nameEn: "A4 Notebook", descAr: "دفتر مسطر عالي الجودة", descEn: "High quality ruled notebook", price: 2.5, category: "stationery", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop&auto=format", stock: 500, available: 1 },
    { id: "p2", nameAr: "أقلام حبر جاف (علبة 12)", nameEn: "Ballpoint Pens (Box 12)", descAr: "أقلام حبر جاف زرقاء عالية الجودة", descEn: "Blue ballpoint pens, pack of 12", price: 3.0, category: "stationery", image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400&h=300&fit=crop&auto=format", stock: 1000, available: 1 },
    { id: "p3", nameAr: "ورق طباعة A4 (رزمة)", nameEn: "A4 Printing Paper (Ream)", descAr: "ورق طباعة أبيض 80 جرام", descEn: "White printing paper 80gsm", price: 8.0, category: "stationery", image: "https://images.unsplash.com/photo-1568667256549-094345857637?w=400&h=300&fit=crop&auto=format", stock: 200, available: 1 },
    { id: "p4", nameAr: "ملفات تجميع", nameEn: "Filing Folders", descAr: "ملفات بلاستيكية متعددة الألوان", descEn: "Colorful plastic folders", price: 1.5, category: "stationery", image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop&auto=format", stock: 300, available: 1 },
    { id: "p5", nameAr: "لاب توب أعمال", nameEn: "Business Laptop", descAr: "لاب توب للأعمال بمعالج i7 وذاكرة 16GB", descEn: "Business laptop, i7 processor, 16GB RAM", price: 850.0, category: "computers", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop&auto=format", stock: 15, available: 1 },
    { id: "p6", nameAr: "طابعة ليزر", nameEn: "Laser Printer", descAr: "طابعة ليزر أحادية عالية السرعة", descEn: "High-speed monochrome laser printer", price: 320.0, category: "computers", image: "https://images.unsplash.com/photo-1612815292170-e0ca0e4ccf38?w=400&h=300&fit=crop&auto=format", stock: 8, available: 1 },
    { id: "p7", nameAr: "شاشة كمبيوتر 24\"", nameEn: "24\" Monitor", descAr: "شاشة FHD مناسبة للمكاتب", descEn: "FHD office monitor", price: 180.0, category: "computers", image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=300&fit=crop&auto=format", stock: 20, available: 1 },
    { id: "p8", nameAr: "ماوس ولوحة مفاتيح لاسلكي", nameEn: "Wireless Mouse & Keyboard", descAr: "طقم ماوس ولوحة مفاتيح لاسلكية", descEn: "Wireless mouse and keyboard combo", price: 45.0, category: "computers", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop&auto=format", stock: 50, available: 1 },
    { id: "p9", nameAr: "خدمة تحصيل فواتير", nameEn: "Bill Collection Service", descAr: "خدمة تحصيل وسداد فواتير البنوك", descEn: "Bank bill collection and payment service", price: 5.0, category: "banking", image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop&auto=format", stock: 9999, available: 1 },
    { id: "p10", nameAr: "خدمة تحويل مالي", nameEn: "Money Transfer Service", descAr: "خدمة التحويل المالي عبر البنوك", descEn: "Bank money transfer service", price: 10.0, category: "banking", image: "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=400&h=300&fit=crop&auto=format", stock: 9999, available: 1 }
  ];

  const banks = [
    { id: "b1", nameAr: "بنك اليمن الدولي", nameEn: "Yemen International Bank", accountNumber: "1234567890123", active: 1 },
    { id: "b2", nameAr: "محفظة جيب", nameEn: "Jaib Wallet", accountNumber: "9876543210987", active: 1 },
    { id: "b3", nameAr: "بنك التضامن الاسلامي", nameEn: "Solidarity Islamic Bank", accountNumber: "1122334455667", active: 0 }
  ];

  const employees = [
    { id: "e1", nameAr: "أحمد محمد", nameEn: "Ahmed Mohammed", phone: "0912345678", active: 1 },
    { id: "e2", nameAr: "خالد عمر", nameEn: "Khaled Omar", phone: "0923456789", active: 1 },
    { id: "e3", nameAr: "يوسف إبراهيم", nameEn: "Yousef Ibrahim", phone: "0934567890", active: 0 }
  ];

  const staff = [
    { id: "s1", username: "admin", password: "admin123", nameAr: "مدير النظام", nameEn: "System Admin", role: "admin", active: 1 },
    { id: "s2", username: "cs1", password: "cs123", nameAr: "نور محمد", nameEn: "Nour Mohammed", role: "customer_service", active: 1 },
    { id: "s3", username: "wh1", password: "wh123", nameAr: "حسام خالد", nameEn: "Hossam Khaled", role: "warehouse", active: 1 },
    { id: "s4", username: "del1", password: "del123", nameAr: "أحمد محمد", nameEn: "Ahmed Mohammed", role: "delivery", active: 1 }
  ];

  const reviews = [
    { id: "r1", customerName: "محمد علي", rating: 5, comment: "خدمة ممتازة وتوصيل سريع جداً", type: "review", hidden: 0, reply: null, createdAt: "2026-05-10" },
    { id: "r2", customerName: "فاطمة حسن", rating: 4, comment: "منتجات ذات جودة عالية", type: "review", hidden: 0, reply: null, createdAt: "2026-05-15" },
    { id: "r3", customerName: "عمر الشيخ", rating: 3, comment: "التوصيل تأخر قليلاً", type: "complaint", hidden: 0, reply: null, createdAt: "2026-05-20" },
    { id: "r4", customerName: "سارة أحمد", rating: 5, comment: "أتمنى إضافة المزيد من منتجات الكمبيوتر", type: "suggestion", hidden: 0, reply: null, createdAt: "2026-06-01" }
  ];

  const insertCategory = db.prepare(`INSERT INTO categories (id, nameAr, nameEn, icon, descAr, descEn) VALUES (@id, @nameAr, @nameEn, @icon, @descAr, @descEn)`);
  const insertProduct = db.prepare(`INSERT INTO products (id, nameAr, nameEn, descAr, descEn, price, category, image, stock, available) VALUES (@id, @nameAr, @nameEn, @descAr, @descEn, @price, @category, @image, @stock, @available)`);
  const insertBank = db.prepare(`INSERT INTO banks (id, nameAr, nameEn, accountNumber, active) VALUES (@id, @nameAr, @nameEn, @accountNumber, @active)`);
  const insertEmployee = db.prepare(`INSERT INTO employees (id, nameAr, nameEn, phone, active) VALUES (@id, @nameAr, @nameEn, @phone, @active)`);
  const insertStaff = db.prepare(`INSERT INTO staff (id, username, password, nameAr, nameEn, role, active) VALUES (@id, @username, @password, @nameAr, @nameEn, @role, @active)`);
  const insertReview = db.prepare(`INSERT INTO reviews (id, customerName, rating, comment, type, hidden, reply, createdAt) VALUES (@id, @customerName, @rating, @comment, @type, @hidden, @reply, @createdAt)`);
  const insertMany = db.transaction(() => {
    categories.forEach(category => insertCategory.run(category));
    products.forEach(product => insertProduct.run(product));
    banks.forEach(bank => insertBank.run(bank));
    employees.forEach(employee => insertEmployee.run(employee));
    staff.forEach(staffRow => insertStaff.run(staffRow));
    reviews.forEach(review => insertReview.run(review));
  });

  if (prodCount === 0) {
    // If no products exist, seed everything (categories, products, banks, employees, staff, reviews)
    insertMany();
    return;
  }

  if (catCount === 0) {
    // If products exist but categories table is empty, only insert categories
    const insertCats = db.transaction(() => { categories.forEach(c => insertCategory.run(c)); });
    insertCats();
  }
}

seedIfEmpty();

function boolean(value) {
  return value ? 1 : 0;
}

function parseRow(row) {
  if (!row) return row;
  const copy = { ...row };
  const booleanFields = new Set(["active", "available", "hidden", "isQuotation"]);
  for (const key of Object.keys(copy)) {
    if (booleanFields.has(key) && copy[key] === 0) copy[key] = false;
    else if (booleanFields.has(key) && copy[key] === 1) copy[key] = true;
    if (key === "createdAt") copy[key] = new Date(copy[key]);
  }
  return copy;
}

function parseRows(rows) {
  return rows.map(parseRow);
}

app.get("/api/products", (req, res) => {
  const rows = db.prepare("SELECT * FROM products").all();
  res.json(parseRows(rows));
});

app.post("/api/products", (req, res) => {
  const { nameAr, nameEn, descAr, descEn, price, category, image = "", stock, available } = req.body;
  const product = {
    id: `p${Date.now()}`,
    nameAr,
    nameEn,
    descAr,
    descEn,
    price,
    category,
    image,
    stock,
    available: boolean(available),
  };

  db.prepare(`INSERT INTO products (id, nameAr, nameEn, descAr, descEn, price, category, image, stock, available) VALUES (@id, @nameAr, @nameEn, @descAr, @descEn, @price, @category, @image, @stock, @available)`).run(product);
  res.json({ success: true, product: parseRow(product) });
});
// جلب الإعدادات
app.get("/api/settings", (req, res) => {
  const row = db.prepare("SELECT * FROM settings WHERE id = 1").get();
  if (row) {
    res.json(row);
  } else {
    res.json({ id: 1, quotationValidityDays: 3 });
  }
});

// تحديث الإعدادات
app.put("/api/settings", (req, res) => {
  const { quotationValidityDays } = req.body;

  try {
    // تحديث القيمة
    db.prepare("UPDATE settings SET quotationValidityDays = ? WHERE id = 1")
      .run(quotationValidityDays);

    // جلب القيمة بعد التحديث
    const row = db.prepare("SELECT * FROM settings WHERE id = 1").get();
    res.json(row);
  } catch (error) {
    console.error("خطأ أثناء تحديث الإعدادات:", error);
    res.status(500).json({ error: "فشل تحديث الإعدادات" });
  }
});


app.get("/api/categories", (req, res) => {
  const rows = db.prepare("SELECT * FROM categories").all();
  res.json(rows);
});

app.post("/api/categories", (req, res) => {
  const category = { ...req.body, id: req.body.id || `cat-${Date.now()}` };
  db.prepare("INSERT INTO categories (id, nameAr, nameEn, icon, descAr, descEn) VALUES (@id, @nameAr, @nameEn, @icon, @descAr, @descEn)").run(category);
  res.json({ success: true, category });
});

app.put("/api/categories/:id", (req, res) => {
  const category = { ...req.body, id: req.params.id };
  db.prepare("UPDATE categories SET nameAr=@nameAr, nameEn=@nameEn, icon=@icon, descAr=@descAr, descEn=@descEn WHERE id=@id").run(category);
  res.json({ success: true, category });
});

app.delete("/api/categories/:id", (req, res) => {
  db.prepare("DELETE FROM categories WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

app.put("/api/products/:id", (req, res) => {
  const { nameAr, nameEn, descAr, descEn, price, category, image = "", stock, available } = req.body;
  const product = {
    id: req.params.id,
    nameAr,
    nameEn,
    descAr,
    descEn,
    price,
    category,
    image,
    stock,
    available: boolean(available),
  };

  db.prepare(`UPDATE products SET nameAr=@nameAr, nameEn=@nameEn, descAr=@descAr, descEn=@descEn, price=@price, category=@category, image=@image, stock=@stock, available=@available WHERE id=@id`).run(product);
  res.json({ success: true, product: parseRow(product) });
});

app.delete("/api/products/:id", (req, res) => {
  db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

app.get("/api/banks", (req, res) => {
  const rows = db.prepare("SELECT * FROM banks").all();
  res.json(parseRows(rows));
});
app.post("/api/banks", (req, res) => {
  const bank = { ...req.body, id: `b${Date.now()}`, active: 1 };
  db.prepare("INSERT INTO banks (id, nameAr, nameEn, accountNumber, active) VALUES (@id, @nameAr, @nameEn, @accountNumber, @active)").run(bank);
  res.json({ success: true, bank: parseRow(bank) });
});
app.put("/api/banks/:id", (req, res) => {
  const bank = { ...req.body, active: boolean(req.body.active) };
  db.prepare("UPDATE banks SET nameAr=@nameAr, nameEn=@nameEn, accountNumber=@accountNumber, active=@active WHERE id=@id").run({ ...bank, id: req.params.id });
  res.json({ success: true, bank: parseRow({ ...bank, id: req.params.id }) });
});
app.delete("/api/banks/:id", (req, res) => {
  db.prepare("DELETE FROM banks WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

app.get("/api/employees", (req, res) => {
  const rows = db.prepare("SELECT * FROM employees").all();
  res.json(parseRows(rows));
});
app.post("/api/employees", (req, res) => {
  const employee = { ...req.body, id: `e${Date.now()}`, active: 1 };
  db.prepare("INSERT INTO employees (id, nameAr, nameEn, phone, active) VALUES (@id, @nameAr, @nameEn, @phone, @active)").run(employee);
  res.json({ success: true, employee: parseRow(employee) });
});
app.put("/api/employees/:id", (req, res) => {
  const employee = { ...req.body, active: boolean(req.body.active) };
  db.prepare("UPDATE employees SET nameAr=@nameAr, nameEn=@nameEn, phone=@phone, active=@active WHERE id=@id").run({ ...employee, id: req.params.id });
  res.json({ success: true, employee: parseRow({ ...employee, id: req.params.id }) });
});
app.delete("/api/employees/:id", (req, res) => {
  db.prepare("DELETE FROM employees WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

app.get("/api/staff", (req, res) => {
  const rows = db.prepare("SELECT * FROM staff").all();
  res.json(parseRows(rows));
});
app.post("/api/staff", (req, res) => {
  const staffRow = { ...req.body, id: `s${Date.now()}`, active: 1 };
  db.prepare("INSERT INTO staff (id, username, password, nameAr, nameEn, role, active) VALUES (@id, @username, @password, @nameAr, @nameEn, @role, @active)").run(staffRow);
  res.json({ success: true, staff: parseRow(staffRow) });
});
app.put("/api/staff/:id", (req, res) => {
  const staffRow = { ...req.body, active: boolean(req.body.active) };
  db.prepare("UPDATE staff SET username=@username, password=@password, nameAr=@nameAr, nameEn=@nameEn, role=@role, active=@active WHERE id=@id").run({ ...staffRow, id: req.params.id });
  res.json({ success: true, staff: parseRow({ ...staffRow, id: req.params.id }) });
});
app.delete("/api/staff/:id", (req, res) => {
  db.prepare("DELETE FROM staff WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

app.get("/api/reviews", (req, res) => {
  const rows = db.prepare("SELECT * FROM reviews").all();
  res.json(parseRows(rows));
});
app.post("/api/reviews", (req, res) => {
  const review = { 
    ...req.body, 
    id: `r${Date.now()}`, 
    hidden: boolean(req.body.hidden), 
    reply: req.body.reply || "",   // ✅ قيمة افتراضية
    createdAt: new Date().toISOString().slice(0, 10) 
  };

  db.prepare("INSERT INTO reviews (id, customerName, rating, comment, type, hidden, reply, createdAt) VALUES (@id, @customerName, @rating, @comment, @type, @hidden, @reply, @createdAt)").run(review);
  res.json({ success: true, review: parseRow(review) });
});

app.put("/api/reviews/:id", (req, res) => {
  const review = { 
    ...req.body, 
    hidden: boolean(req.body.hidden), 
    reply: req.body.reply || ""   // قيمة افتراضية
  };
  db.prepare("UPDATE reviews SET customerName=@customerName, rating=@rating, comment=@comment, type=@type, hidden=@hidden, reply=@reply WHERE id=@id").run({ ...review, id: req.params.id });
  const row = db.prepare("SELECT * FROM reviews WHERE id = ?").get(req.params.id);
  res.json({ success: true, review: parseRow(row) });
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const row = db.prepare("SELECT * FROM staff WHERE username = ? AND password = ? AND active = 1").get(username, password);
  if (!row) return res.status(401).json({ success: false, message: "Invalid credentials" });
  res.json(parseRow(row));
});

app.get("/api/orders", (req, res) => {
  const orders = parseRows(db.prepare("SELECT * FROM orders").all());
  const itemsStmt = db.prepare(`
    SELECT
      oi.id,
      oi.orderId,
      oi.productId,
      oi.quantity,
      oi.price,
      p.nameAr,
      p.nameEn,
      p.descAr,
      p.descEn,
      p.category,
      p.image,
      p.stock,
      p.available
    FROM order_items oi
    LEFT JOIN products p ON p.id = oi.productId
    WHERE oi.orderId = ?
  `);
  const result = orders.map(order => ({
    ...order,
    items: itemsStmt.all(order.id).map(item => ({
      quantity: item.quantity,
      price: item.price,
      product: parseRow({
        id: item.productId,
        nameAr: item.nameAr,
        nameEn: item.nameEn,
        descAr: item.descAr,
        descEn: item.descEn,
        price: item.price,
        category: item.category,
        image: item.image,
        stock: item.stock,
        available: item.available
      })
    }))
  }));
  res.json(result);
});

app.post("/api/orders", (req, res) => {
  const order = { ...req.body };
  order.isQuotation = order.isQuotation ? 1 : 0;
  const prefix = order.isQuotation === 1 ? "QUT" : "ORD";
  order.id = order.id || `${prefix}-${Date.now()}`;
  order.createdAt = new Date().toISOString();
  
  order.bankId = order.bankId || null;
  order.transferRef = order.transferRef || null;
  order.deliveryEmployeeId = order.deliveryEmployeeId || null;
  order.customerEmail = order.customerEmail || null;
  order.quotationValidity = order.quotationValidity ?? null;
  order.status = order.status || (order.isQuotation ? "closed" : "pending");

  if (!Array.isArray(order.items) || order.items.length === 0) {
    return res.status(400).json({ success: false, message: "Order items are required" });
  }

  db.prepare(`INSERT INTO orders (id, customerName, customerPhone, customerEmail, deliveryAddress, total, paymentMethod, bankId, transferRef, status, deliveryEmployeeId, createdAt, isQuotation, quotationValidity) VALUES (@id, @customerName, @customerPhone, @customerEmail, @deliveryAddress, @total, @paymentMethod, @bankId, @transferRef, @status, @deliveryEmployeeId, @createdAt, @isQuotation, @quotationValidity)`).run(order);

  const insertItem = db.prepare("INSERT INTO order_items (orderId, productId, quantity, price) VALUES (?, ?, ?, ?)");
  for (const item of order.items) {
    const productId = item.product?.id || item.productId;
    const quantity = Number(item.quantity || 0);
    const price = Number(item.price || 0);
    if (!productId || quantity <= 0) {
      return res.status(400).json({ success: false, message: "Each order item must have a valid product ID and quantity" });
    }
    insertItem.run(order.id, productId, quantity, price);
  }

  const orderRow = parseRow({ ...order, isQuotation: order.isQuotation, items: order.items });
  res.json({ success: true, order: orderRow });

  // send email asynchronously (don't block response)
  (async () => {
    try {
      const to = order.customerEmail;
      if (!to) return;

      const subject = order.isQuotation ? `Quotation ${order.id}` : `Order Received ${order.id}`;
      let text = `${order.isQuotation ? 'Quotation' : 'Order'} ID: ${order.id}\nDate: ${order.createdAt}\nCustomer: ${order.customerName}\nPhone: ${order.customerPhone}\nTotal: ${order.total}\n\nItems:\n`;
      for (const it of order.items) {
        const name = it.product?.nameEn || it.product?.nameAr || it.productId || 'Item';
        text += `- ${name} x ${it.quantity} @ ${it.price}\n`;
      }
      text += `\nThank you for your ${order.isQuotation ? 'quotation request' : 'order'}.`;

      const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #222;">
          <h2 style="color: #1a73e8;">${order.isQuotation ? 'Quotation' : 'Order'} Received</h2>
          <p>Order ID: <strong>${order.id}</strong></p>
          <p>Date: ${order.createdAt}</p>
          <p>Customer: ${order.customerName}</p>
          <p>Phone: ${order.customerPhone}</p>
          <p>Total: <strong>${order.total}</strong></p>
          <h3>Items</h3>
          <ul>
            ${order.items
              .map(
                (it) =>
                  `<li>${it.product?.nameEn || it.product?.nameAr || it.productId || 'Item'} x ${it.quantity} @ ${it.price}</li>`
              )
              .join('')}
          </ul>
          <p>Thank you for your ${order.isQuotation ? 'quotation request' : 'order'}.</p>
        </div>
      `;

      console.log("=== START SENDING EMAIL ===");
      console.log("Order ID:", order.id);
      console.log("To:", to);
      console.log("Subject:", subject);
      console.log("From:", sender.email);

      const result = await sendEmailViaBrevo({
        to,
        subject,
        text,
        html,
      });

      console.log("Brevo Response:", result);
      console.log("=== EMAIL SENT SUCCESSFULLY ===");
      console.log(`Order email sent to ${to} for ${order.id}`);
    } catch (err) {
      console.error("Failed to send order email:", err);
    }
  })();
});

app.put("/api/orders/:id", (req, res) => {
  const payload = req.body;
  const fields = [];
  const params = { id: req.params.id };
  for (const key of ["status", "deliveryEmployeeId", "paymentMethod", "bankId", "transferRef", "customerName", "customerPhone", "customerEmail", "deliveryAddress", "total", "quotationValidity"]) {
    if (payload[key] !== undefined) {
      fields.push(`${key} = @${key}`);
      params[key] = payload[key];
    }
  }
  if (fields.length === 0) return res.status(400).json({ success: false, message: "No fields to update" });
  db.prepare(`UPDATE orders SET ${fields.join(", ")} WHERE id = @id`).run(params);

  const orderRow = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);
  if (!orderRow) return res.status(404).json({ success: false, message: "Order not found" });

  const itemsStmt = db.prepare(`
    SELECT
      oi.id,
      oi.orderId,
      oi.productId,
      oi.quantity,
      oi.price,
      p.nameAr,
      p.nameEn,
      p.descAr,
      p.descEn,
      p.category,
      p.image,
      p.stock,
      p.available
    FROM order_items oi
    LEFT JOIN products p ON p.id = oi.productId
    WHERE oi.orderId = ?
  `);

  const order = parseRow(orderRow);
  order.items = itemsStmt.all(order.id).map(item => ({
    quantity: item.quantity,
    price: item.price,
    product: parseRow({
      id: item.productId,
      nameAr: item.nameAr,
      nameEn: item.nameEn,
      descAr: item.descAr,
      descEn: item.descEn,
      price: item.price,
      category: item.category,
      image: item.image,
      stock: item.stock,
      available: item.available
    })
  }));

  res.json(order);
});

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.get("/api/email-status", (req, res) => {
  try {
    res.json({
      ok: true,
      brevoConfigured: Boolean(brevoApiKey && sender.email),
      senderEmail: sender.email,
      senderName: sender.name,
      smtpHost: process.env.SMTP_HOST || null,
    });
  } catch (err) {
    res.json({ ok: false, error: String(err) });
  }
});

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
