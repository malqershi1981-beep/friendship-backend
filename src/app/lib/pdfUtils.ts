import { jsPDF } from "jspdf";
import amiriFont from "../../Amiri-Regular-normal.js"; 

// إعداد الخط العربي
export function setupArabicFont(doc: jsPDF) {
  doc.addFileToVFS("Amiri-Regular.ttf", amiriFont);
  doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
  doc.setFont("Amiri", "normal");
}

export interface PdfTextOptions {
  fontSize?: number;
  fontFamily?: string;
  fontStyle?: string;
  color?: string;
  maxWidth?: number;
  align?: "left" | "center" | "right";
  dir?: "ltr" | "rtl";
  lineHeight?: number;
  prepared?: boolean;
  anchor?: "left" | "right";
}

const DEFAULT_FONT_FAMILY = "Amiri";
const DEFAULT_FONT_SIZE = 11;
const DEFAULT_LINE_HEIGHT_FACTOR = 1.35;

const ARABIC_TEXT_RE = /[\u0600-\u06FF]/;

function isArabicText(text: string) {
  return ARABIC_TEXT_RE.test(text);
}

function preparePdfText(doc: jsPDF, text: string, dir: "ltr" | "rtl") {
  // Only apply the library's Arabic shaping when needed.
  if (dir === "rtl" && typeof (doc as any).processArabic === "function") {
    return (doc as any).processArabic(text);
  }
  return text;
}

export function splitPdfTextToSize(
  doc: jsPDF,
  text: string,
  maxWidth: number,
  options: { fontFamily?: string; fontStyle?: string; fontSize?: number; dir?: "ltr" | "rtl" } = {},
) {
  const fontSize = options.fontSize ?? DEFAULT_FONT_SIZE;
  const fontFamily = options.fontFamily ?? DEFAULT_FONT_FAMILY;
  const fontStyle = options.fontStyle ?? "normal";
  const dir = options.dir ?? (isArabicText(text) ? "rtl" : "ltr");

  doc.setFont(fontFamily, fontStyle);
  doc.setFontSize(fontSize);
  return doc.splitTextToSize(preparePdfText(doc, text, dir), maxWidth);
}

export function drawPdfText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  options: PdfTextOptions = {},
) {
  setupArabicFont(doc);

  const fontSize = options.fontSize ?? DEFAULT_FONT_SIZE;
  const fontFamily = options.fontFamily ?? DEFAULT_FONT_FAMILY;
  const fontStyle = options.fontStyle ?? "normal";
  const dir = options.dir ?? (isArabicText(text) ? "rtl" : "ltr");
  const align = options.align ?? (dir === "rtl" ? "right" : "left");
  const maxWidth = options.maxWidth;
  const lineHeight = options.lineHeight ?? Math.ceil(fontSize * DEFAULT_LINE_HEIGHT_FACTOR);
  const color = options.color ?? "#000000";

  doc.setFont(fontFamily, fontStyle);
  doc.setFontSize(fontSize);

  if (color.startsWith("#")) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    doc.setTextColor(r, g, b);
  }

  const preparedText = options.prepared ? text : preparePdfText(doc, text, dir);
  const lines = maxWidth ? doc.splitTextToSize(preparedText, maxWidth) : String(preparedText).split(/\r?\n/);
  doc.text(lines, x, y, { align });

  doc.setTextColor(0, 0, 0);
  return Array.isArray(lines) ? lines.length * lineHeight : lineHeight;
}

export function drawPdfLabelValue(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  options: PdfTextOptions & { gap?: number; labelDir?: "ltr" | "rtl"; valueDir?: "ltr" | "rtl"; rightBound?: number; desiredGap?: number } = {},
) {
  setupArabicFont(doc);

  const fontSize = options.fontSize ?? DEFAULT_FONT_SIZE;
  const fontFamily = options.fontFamily ?? DEFAULT_FONT_FAMILY;
  const fontStyle = options.fontStyle ?? "normal";
  const gap = options.gap ?? 6;
  const desiredGap = options.desiredGap ?? gap;
  const labelDir = options.labelDir ?? (isArabicText(label) ? "rtl" : "ltr");
  const valueDir = options.valueDir ?? (isArabicText(value) ? "rtl" : "ltr");
  const anchor = options.anchor ?? (labelDir === "rtl" ? "right" : "left");
  const color = options.color ?? "#000000";
  const maxWidth = options.maxWidth;

  doc.setFont(fontFamily, fontStyle);
  doc.setFontSize(fontSize);
  if (color.startsWith("#")) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    doc.setTextColor(r, g, b);
  }

  // Prepare texts applying shaping where appropriate
  const preparedLabel = preparePdfText(doc, label, labelDir);
  const preparedValue = preparePdfText(doc, value, valueDir);

  // Choose fonts per direction to avoid glyph fallback: Arabic labels use Amiri, LTR values use the provided font
  const labelFont = labelDir === "rtl" ? DEFAULT_FONT_FAMILY : fontFamily;
  const valueFont = valueDir === "ltr" ? fontFamily : DEFAULT_FONT_FAMILY;

  // Measure widths using appropriate fonts
  doc.setFont(labelFont, fontStyle);
  doc.setFontSize(fontSize);
  const labelWidth = doc.getTextWidth(preparedLabel);

  doc.setFont(valueFont, fontStyle);
  doc.setFontSize(fontSize);
  const valueWidth = doc.getTextWidth(preparedValue);

  const availableValueWidth = maxWidth ? Math.max(0, maxWidth - labelWidth - gap) : undefined;

  let labelLeftX: number;
  let valueLeftX: number;
  let labelAlign: "left" | "right" = "left";
  let valueAlign: "left" | "right" = "left";

  if (anchor === "right") {
    labelAlign = "right";
    const rightBound = typeof options.rightBound === "number" ? options.rightBound : x;
    const labelRightX = rightBound - desiredGap;
    const labelLeftEdge = labelRightX - labelWidth;
    labelLeftX = labelRightX;

    if (valueDir === "rtl") {
      valueAlign = "right";
      valueLeftX = labelLeftEdge - gap;
    } else {
      valueAlign = "left";
      const effectiveValueWidth = maxWidth ? Math.min(valueWidth, availableValueWidth!) : valueWidth;
      valueLeftX = labelLeftEdge - gap - effectiveValueWidth;
    }
  } else {
    // x is a left anchor; label starts at x, value to its right
    labelAlign = "left";
    valueAlign = "left";
    labelLeftX = x;
    valueLeftX = x + labelWidth + gap;
  }

  // Draw value then label using their chosen fonts to avoid mixing glyph runs
  const valueHeight = drawPdfText(doc, preparedValue, valueLeftX, y, {
    ...options,
    align: valueAlign,
    dir: valueDir,
    fontFamily: valueFont,
    fontStyle,
    fontSize,
    maxWidth: availableValueWidth,
    prepared: true,
  });

  const labelHeight = drawPdfText(doc, preparedLabel, labelLeftX, y, {
    ...options,
    align: labelAlign,
    dir: labelDir,
    fontFamily: labelFont,
    fontStyle,
    fontSize,
    prepared: true,
  });

  doc.setTextColor(0, 0, 0);
  return Math.max(valueHeight, labelHeight);
}

// مثال عملي: عرض سعر باللغتين
export function generateQuotationPdf() {
  const doc = new jsPDF();

  // ===== عرض سعر =====
  drawPdfText(doc, "عرض سعر", 200, 20, { align: "right", dir: "rtl", fontSize: 20 });
  drawPdfText(doc, "رقم الطلب QUT-1783196991124", 200, 35, { align: "right" });
  drawPdfText(doc, "التاريخ: 02/06/1447هـ", 200, 45, { align: "right" });
  drawPdfText(doc, "العميل: محمد", 200, 55, { align: "right", dir: "rtl" });
  drawPdfText(doc, "الهاتف: 7798", 200, 65, { align: "right" });
  drawPdfText(doc, "البريد الإلكتروني: mohammedalqershi101980@gmail.com", 200, 75, { align: "right" });
  drawPdfText(doc, "صالح لمدة 4 أيام", 200, 85, { align: "right", dir: "rtl" });

  drawPdfText(doc, "المنتج | الكمية | سعر الوحدة | الإجمالي", 200, 105, { align: "right", dir: "rtl", fontSize: 12 });
  drawPdfText(doc, "لاب توب أعمال | 1 | $850.00 | $850.00", 200, 115, { align: "right", dir: "rtl" });
  drawPdfText(doc, "طابعة ليزر | 1 | $320.00 | $320.00", 200, 125, { align: "right", dir: "rtl" });
  drawPdfText(doc, "شاشة كمبيوتر 24\" | 1 | $180.00 | $180.00", 200, 135, { align: "right", dir: "rtl" });

  drawPdfText(doc, "المبلغ الإجمالي: $1350.00", 200, 155, { align: "right", fontSize: 14 });

  // ===== طلب شراء =====
  drawPdfText(doc, "طلب شراء", 200, 180, { align: "right", dir: "rtl", fontSize: 20 });
  drawPdfText(doc, "رقم الطلب: ORD-1783201976182", 200, 195, { align: "right" });
  drawPdfText(doc, "تاريخ الطلب: 02/06/2023", 200, 205, { align: "right" });
  drawPdfText(doc, "العميل: محمد", 200, 215, { align: "right", dir: "rtl" });
  drawPdfText(doc, "الهاتف: 7778787", 200, 225, { align: "right" });
  drawPdfText(doc, "البريد الإلكتروني: MOHAMMEDALQERSHI101980@GMAIL.COM", 200, 235, { align: "right" });

  drawPdfText(doc, "المنتج | الكمية | سعر الوحدة | الإجمالي", 200, 255, { align: "right", dir: "rtl", fontSize: 12 });
  drawPdfText(doc, "لاب توب أعمال | 1 | $850.00 | $850.00", 200, 265, { align: "right", dir: "rtl" });
  drawPdfText(doc, "طابعة ليزر | 1 | $320.00 | $320.00", 200, 275, { align: "right", dir: "rtl" });
  drawPdfText(doc, "شاشة كمبيوتر 24\" | 1 | $180.00 | $180.00", 200, 285, { align: "right", dir: "rtl" });

  drawPdfText(doc, "المبلغ الإجمالي: $1350.00", 200, 305, { align: "right", fontSize: 14 });
  drawPdfText(doc, "طريقة الدفع: نقداً عند التسليم", 200, 315, { align: "right", dir: "rtl" });

  // ===== النسخة الإنجليزية =====
  drawPdfText(doc, "Quotation", 15, 20, { align: "left", dir: "ltr", fontSize: 18 });
  drawPdfText(doc, "Order ID: QUT-1783196991124", 15, 35, { align: "left", dir: "ltr" });
  drawPdfText(doc, "Date: 7/6/1437H", 15, 45, { align: "left", dir: "ltr" });
  drawPdfText(doc, "Customer: Mohammed", 15, 55, { align: "left", dir: "ltr" });
  drawPdfText(doc, "Phone: 7798", 15, 65, { align: "left", dir: "ltr" });
  drawPdfText(doc, "Email: mohammedalqershi101980@gmail.com", 15, 75, { align: "left", dir: "ltr" });
  drawPdfText(doc, "Valid for 4 days", 15, 85, { align: "left", dir: "ltr" });

  drawPdfText(doc, "Item | Qty | Unit Price | Total", 15, 105, { align: "left", dir: "ltr", fontSize: 12 });
  drawPdfText(doc, "Business Laptop | 1 | $850.00 | $850.00", 15, 115, { align: "left", dir: "ltr" });
  drawPdfText(doc, "Laser Printer | 1 | $320.00 | $320.00", 15, 125, { align: "left", dir: "ltr" });
  drawPdfText(doc, "24\" Monitor | 1 | $180.00 | $180.00", 15, 135, { align: "left", dir: "ltr" });

    drawPdfText(doc, "Total Due: $1350.00", 15, 155, { align: "left", dir: "ltr", fontSize: 14 });

  // حفظ الملف
  doc.save("quotation-bilingual.pdf");
}
