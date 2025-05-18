// pages/Admin.js
import React, { useContext } from "react";
import { UserContext } from "../context/UserContext";
import { Navigate, NavLink, Routes, Route, useLocation } from "react-router-dom";
import styles from "../styles/Admin.module.css";
import AdminProducts from "./AdminProducts";
import AdminUsers from "./AdminUsers";
import AdminOrders from "./AdminOrders";
import Editproducts from "./Editproducts";
import AdminCategories from "./AdminCategories";

const Admin = () => {
  const { user } = useContext(UserContext);
  const location = useLocation();

  if (user === null) return <p>Loading...</p>;
  if (!user || user.role !== "admin") return <Navigate to="/" replace />;

  const activeTab = location.pathname.split("/")[2] || "products";

  return (
    <div className={styles.adminWrapper}>
      <h1>Admin Dashboard</h1>
      
      <div className={styles.navTabs}>
        <NavLink
          to="/admin/products"
          className={({ isActive }) => isActive ? styles.activeTab : ""}
        >
          📦 Products
        </NavLink>
        <NavLink
          to="/admin/orders"
          className={({ isActive }) => isActive ? styles.activeTab : ""}
        >
          🧾 Orders
        </NavLink>
        <NavLink
          to="/admin/users"
          className={({ isActive }) => isActive ? styles.activeTab : ""}
        >
          👥 Users
        </NavLink>
        <NavLink
          to="/admin/brands"
          className={({ isActive }) => isActive ? styles.activeTab : ""}
        >
          🏷️ Brands
        </NavLink>
        <NavLink
          to="/admin/categories"
          className={({ isActive }) => isActive ? styles.activeTab : ""}
        >
          📑 Categories
        </NavLink>
      </div>

      <div className={styles.tabContent}>
        <Routes>
          <Route path="/" element={<Navigate to="products" />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/edit/:sku" element={<Editproducts />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="categories" element={<AdminCategories />} />
        </Routes>
      </div>

      {activeTab === "brands" && (
        <iframe src="/admin/brands" title="Brands Management" className={styles.iframe} />
      )}
    </div>
  );
};

export default Admin;
