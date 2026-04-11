import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StoreProvider } from "@/context/StoreContext";
import { AuthProvider } from "@/context/AuthContext";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { CartModal } from "@/components/Shop/CartModal";
import { WishlistModal } from "@/components/Shop/WishlistModal";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminLayout } from "@/components/Admin/AdminLayout";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import ProductPage from "./pages/ProductPage";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import GiftCard from "./pages/GiftCard";
import Workshops from "./pages/Workshops";
import Contacts from "./pages/Contacts";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Shipping from "./pages/Shipping";
import Delivery from "./pages/Delivery";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminProducts from "./pages/Admin/AdminProducts";
import AdminProductEdit from "./pages/Admin/AdminProductEdit";
import AdminWorkshops from "./pages/Admin/AdminWorkshops";
import AdminWorkshopEdit from "./pages/Admin/AdminWorkshopEdit";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <StoreProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Admin routes - no header/footer */}
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="products/new" element={<AdminProductEdit />} />
                <Route path="products/:id/edit" element={<AdminProductEdit />} />
                <Route path="workshops" element={<AdminWorkshops />} />
                <Route path="workshops/new" element={<AdminWorkshopEdit />} />
                <Route path="workshops/:id/edit" element={<AdminWorkshopEdit />} />
              </Route>
              
              {/* Auth route */}
              <Route path="/auth" element={<Auth />} />
              
              {/* Public routes with header/footer */}
              <Route path="/*" element={
                <div className="min-h-screen flex flex-col">
                  <Header />
                  <main className="flex-1 pt-16">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/catalog" element={<Catalog />} />
                      <Route path="/product/:id" element={<ProductPage />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/checkout/success" element={<CheckoutSuccess />} />
                      <Route path="/gift-card" element={<GiftCard />} />
                      <Route path="/workshops" element={<Workshops />} />
                      <Route path="/contacts" element={<Contacts />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/shipping" element={<Shipping />} />
                      <Route path="/delivery" element={<Delivery />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <Footer />
                  <CartModal />
                  <WishlistModal />
                  <ScrollToTop />
                </div>
              } />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </StoreProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
