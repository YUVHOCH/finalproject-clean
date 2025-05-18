import React, { useState, useEffect } from 'react';
import styles from '../styles/Brands.module.css';
import SearchStrip from '../components/SearchStrip';
import useScrollDirection from '../hooks/useScrollDirection';

const Brands = () => {
  const [brands, setBrands] = useState([]);
  const scrollDirection = useScrollDirection();

  useEffect(() => {
    const fetchBrandsData = async () => {
      try {
        const response = await fetch('http://localhost:8000/brands');
        const data = await response.json();
        if (data && data.length > 0) {
          // מיון המותגים לפי המיקום
          const sortedData = data.sort((a, b) => (a.position || 0) - (b.position || 0));
          // ממפה את הדאטה מהשרת למבנה שאנחנו צריכים
          const formattedBrands = sortedData.map(brand => ({
            name: brand.name,
            image: `/brandspage/${brand.name}.jpg`,
            title: brand.title,
            description: brand.description,
            position: brand.position
          }));
          setBrands(formattedBrands);
        }
      } catch (error) {
        console.error('Error fetching brands data:', error);
      }
    };

    fetchBrandsData();
  }, []);

  return (
    <>
      <div className={`${styles.stickyHeader} ${scrollDirection === "down" ? styles.hideHeader : ""}`}>
        <SearchStrip />
      </div>
      
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>המותגים שלנו</h1>
        
        <div className={styles.brandsGrid}>
          {brands.map((brand) => (
            <div key={brand.name} className={styles.brandCard}>
              <div className={styles.imageContainer}>
                <img 
                  src={brand.image}
                  alt={brand.name}
                  className={styles.brandImage}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/default.jpg';
                  }}
                />
              </div>
              {brand.title && <h2 className={styles.brandTitle}>{brand.title}</h2>}
              {brand.description && <p className={styles.brandDescription}>{brand.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Brands; 