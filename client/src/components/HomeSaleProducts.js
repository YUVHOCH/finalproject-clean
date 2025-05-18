import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';
import styles from '../styles/HomeSaleProducts.module.css';
import cardStyles from '../styles/ProductCard.module.css';

const HomeSaleProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeSaleProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/products');
        const allProducts = response.data.products || [];
        // Filter only products with homeSaleProducts flag without limit
        const homeSaleProducts = allProducts.filter(product => product.homeSaleProducts);
        console.log('Found home sale products:', homeSaleProducts.length);
        setProducts(homeSaleProducts);
      } catch (error) {
        console.error('Error fetching home sale products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeSaleProducts();
  }, []);

  if (loading) {
    return <div className={styles.loading}>טוען מוצרים...</div>;
  }

  return (
    <div className={styles.homeSaleProductsContainer}>
      <h2 className={styles.saleHomeTitle}> מבצעים ומוצרים מומלצים</h2>   
      <div className={styles.productsGrid}>
        {products.map((product) => (
          <ProductCard 
            key={product._id} 
            {...product} 
            className={cardStyles.homeSaleCard}
          />
        ))}
      </div>
    </div>
  );
};

export default HomeSaleProducts; 