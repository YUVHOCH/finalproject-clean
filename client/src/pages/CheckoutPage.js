import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchStrip from '../components/SearchStrip';
import { useNavigate } from 'react-router-dom';

const CheckoutPage = () => {
  const [allProducts, setAllProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // שליפת מוצרים בשביל SearchStrip
    axios.get("http://localhost:8000/products")
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data.products || [];
        setAllProducts(data);
      })
      .catch(err => {
        console.error("Error loading products:", err);
        setAllProducts([]);
      });
  }, []);

  return (
    <div dir="rtl">
      <SearchStrip
        categories={allProducts.map(p => ({
          category: p.category,
          subcategory: p.subcategory,
          subsubcategory: p.subsubcategory
        }))}
      />
      
      <div style={{ padding: '20px' }}>
        <h1>טופס תשלום</h1>
        <p>כאן יבוא טופס התשלום...</p>
      </div>
    </div>
  );
};

export default CheckoutPage; 