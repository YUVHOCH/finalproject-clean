// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { MenuProvider } from "./context/MenuContext";
import { CategoryProvider } from "./context/CategoryContext";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import ProductsPage from "./pages/ProductsPage";
import Header from "./pages/Header";
import TopTicker from "./components/TopTicker";
import SearchStrip from "./components/SearchStrip";
import Register from "./pages/Register";
import LoginPage from "./pages/LoginPage";
import styles from "./styles/App.module.css";
import banner from "./assets/banner.jpg";
import ProtectedRoute from "./components/ProtectedRoute";
import useScrollDirection from "./hooks/useScrollDirection";
import { SearchProvider } from "./context/SearchContext";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import ShippingPolicy from "./pages/ShippingPolicy";
import SaleProducts from './pages/SaleProducts';
import CheckoutPage from './pages/CheckoutPage';
import AdminBrands from './pages/AdminBrands';
import Brands from './pages/Brands';
import Jobs from './pages/Jobs';
import Contact from './pages/Contact';
import StoresList from './pages/StoresList';

function App() {
  const scrollDirection = useScrollDirection();
  return (
    <Router>
      <SearchProvider>
        <UserProvider>
          <MenuProvider>
            <CategoryProvider>
              <div className={styles.app}>
                <div dir="rtl">
                  <div className={`${styles.stickyHeader} ${scrollDirection === "down" ? styles.hideHeader : ""}`}>
                    <TopTicker />
                    <Header />
                  </div>

                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/sales" element={<SaleProducts />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/admin/*" element={<ProtectedRoute requiredRole="admin"><Admin /></ProtectedRoute>} />
                    <Route path="/product/:sku" element={<ProductPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/category/:categorySlug" element={<ProductsPage />} />
                    <Route path="/products/:category?/:subcategory?/:subsubcategory?" element={<ProductsPage />} />
                    <Route path="/shippingpolicy" element={<ShippingPolicy />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/admin/brands" element={<AdminBrands />} />
                    <Route path="/brands" element={<Brands />} />
                    <Route path="/jobs" element={<Jobs />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/storeslist" element={<StoresList />} />
                  </Routes>

                  <footer className={styles.footer}>© 2025 My Garden Shop</footer>
                </div>
              </div>
            </CategoryProvider>
          </MenuProvider>
        </UserProvider>
      </SearchProvider>
    </Router>
  );
}

export default App;