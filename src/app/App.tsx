import "../styles/fonts.css";
import { AppProvider, useApp } from "./context/AppContext";
import { Navbar } from "./components/Navbar";
import { HomePage } from "./components/HomePage";
import { ProductsPage } from "./components/ProductsPage";
import { CartPage } from "./components/CartPage";
import { OrderTrackingPage } from "./components/OrderTrackingPage";
import { LoginPage } from "./components/LoginPage";
import { PortalPage } from "./components/PortalPage";
import { QuotationPurchasePage } from "./components/QuotationPurchasePage";

function AppContent() {
  /* MARKER-MAKE-KIT-INVOKED */
  const { currentPage, lang } = useApp();

  // Full-screen portals (no navbar)
  if (currentPage === "portal") return <PortalPage />;

  const isCategory = currentPage.startsWith("cat_");
  const categoryId = isCategory ? currentPage.replace("cat_", "") : null;

  return (
    <div style={{ fontFamily: lang === "ar" ? "Cairo, sans-serif" : "Inter, sans-serif" }} className="min-h-screen bg-background">
      <Navbar />
      <main>
        {currentPage === "home" && <HomePage />}
        {isCategory && categoryId && <ProductsPage categoryId={categoryId} />}
        {currentPage === "cart" && <CartPage />}
        {currentPage === "track" && <OrderTrackingPage />}
        {currentPage === "login" && <LoginPage />}
        {currentPage === "quotation_purchase" && <QuotationPurchasePage />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
