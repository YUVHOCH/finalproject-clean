import React, { useState, useEffect } from 'react';
import SearchStrip from '../components/SearchStrip';
import ProductCard from '../components/ProductCard';
import axios from 'axios';
import bannerImage from '../assets/bannersale.jpg';
import styles from '../styles/SaleProducts.module.css';
import commonStyles from '../styles/common.module.css';

const SaleProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const productsResponse = await axios.get('http://localhost:8000/products');
        const allProducts = Array.isArray(productsResponse.data)
          ? productsResponse.data
          : productsResponse.data.products || [];

        const categoriesMap = new Map();
        allProducts.forEach(product => {
          if (product.category && product.subcategory && product.subsubcategory) {
            const key = `${product.category}-${product.subcategory}-${product.subsubcategory}`;
            if (!categoriesMap.has(key)) {
              categoriesMap.set(key, {
                category: product.category,
                subcategory: product.subcategory,
                subsubcategory: product.subsubcategory,
                count: 1
              });
            } else {
              const existing = categoriesMap.get(key);
              existing.count++;
            }
          }
        });

        setCategories(Array.from(categoriesMap.values()));

        const saleProducts = allProducts.filter(product => product.isSale === true);
        setProducts(saleProducts);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <SearchStrip categories={categories} />

      <div className={styles.pageContainer}>
        <div className={styles.bannerContainer}>
          <img
            src={bannerImage}
            alt="Sale Banner"
          />
        </div>

        <h2 className={styles.title}>המבצעים שלנו 🔥</h2>

        <div className={styles.productsGridWrapper}>
          <div className={styles.container_productgrid}>
            {loading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
              </div>
            ) : products && products.length > 0 ? (
              products.map((product) => (
                <ProductCard
                  key={product._id}
                  {...product}
                  isSale={true}
                  isSalesPage={true}
                  className={styles.saleProductCard}
                />
              ))
            ) : (
              <div>אין מוצרים במבצע</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SaleProducts; 