//client\src\components\HeroBanner.js
import React, { useState, useEffect } from "react";
import styles from "../styles/HeroBanner.module.css";

const HeroBanner = () => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    const checkBannerExists = async (index) => {
      try {
        const response = await fetch(`/homebanners/banner_${index}.jpg`);
        const exists = response.ok;
        console.log(`Checking banner_${index}.jpg:`, exists ? 'exists' : 'not found');
        return exists;
      } catch (error) {
        console.log(`Error checking banner_${index}.jpg:`, error);
        return false;
      }
    };

    const loadBanners = async () => {
      const bannersList = [];
      
      // Check each banner sequentially
      for (let i = 1; i <= 5; i++) {
        const exists = await checkBannerExists(i);
        if (exists) {
          bannersList.push(`/homebanners/banner_${i}.jpg`);
        }
      }
      
      console.log('Found banners:', bannersList);
      if (bannersList.length > 0) {
        setBanners(bannersList);
        setCurrentBanner(0);
      }
    };

    loadBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [banners.length]);

  const nextBanner = () => {
    if (banners.length <= 1) return;
    setCurrentBanner(prev => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    if (banners.length <= 1) return;
    setCurrentBanner(prev => (prev - 1 + banners.length) % banners.length);
  };

  const goToBanner = (index) => {
    if (index >= 0 && index < banners.length) {
      setCurrentBanner(index);
    }
  };

  if (banners.length === 0) return null;

  return (
    <div className={styles.hero}>
      <div className={styles.bannerContainer}>
        <img 
          src={banners[currentBanner]} 
          alt={`באנר ${currentBanner + 1}`} 
          className={styles.image} 
        />
        
        {banners.length > 1 && (
          <>
            <button 
              className={`${styles.navButton} ${styles.prevButton}`}
              onClick={prevBanner}
              aria-label="באנר קודם"
            >
              &#10095;
            </button>
            
            <button 
              className={`${styles.navButton} ${styles.nextButton}`}
              onClick={nextBanner}
              aria-label="באנר הבא"
            >
              &#10094;
            </button>

            <div className={styles.dots}>
              {banners.map((_, index) => (
                <button
                  key={`dot-${index}`}
                  className={`${styles.dot} ${index === currentBanner ? styles.activeDot : ''}`}
                  onClick={() => goToBanner(index)}
                  aria-label={`עבור לבאנר ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HeroBanner;
