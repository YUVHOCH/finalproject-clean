// src/pages/ProductsPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import { useSearch } from "../context/SearchContext";
import styles from "../styles/ProductsPage.module.css";
import TopTicker from "../components/TopTicker";
import Header from "../pages/Header";
import SearchStrip from "../components/SearchStrip";
import useScrollDirection from "../hooks/useScrollDirection";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const { searchTerm } = useSearch();
  const scrollDirection = useScrollDirection();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:8000/products");
        setProducts(res.data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    const s = searchTerm?.toLowerCase() || "";
    const matchCategory =
      selectedCategory === "" ||
      p.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchSearch =
      p.productName?.toLowerCase().includes(s) ||
      p.brand?.toLowerCase().includes(s) ||
      p.sku?.toString().includes(s);

    return matchCategory && matchSearch;
  });

  return (
       <main className={styles.mainContent}>
         <div className={styles.productsGrid}>
         {filteredProducts.map((prod) => {
          console.log("🔎 מוצר:", prod); // ✅ כאן אתה רואה את כל השדות המועברים
          return <ProductCard key={prod._id || prod.sku} {...prod} />;
        })}

        </div>
      </main>
  );
};

export default ProductsPage;
