import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/MiddleBanners.module.css';

const MiddleBanners = () => {
  const banners = [
    {
      image: "/middlebanners/grid123.jpg",
      link: "/products",
      gridArea: "banner1",
      alt: "באנר ראשי ימני"
    },
    {
      image: "/middlebanners/grid21.jpg",
      link: "/products",
      gridArea: "banner2",
      alt: "באנר אמצעי עליון"
    },
    {
      image: "/middlebanners/grid31.jpg",
      link: "/products",
      gridArea: "banner3",
      alt: "באנר שמאלי עליון"
    },
    {
      image: "/middlebanners/grid232.jpg",
      link: "/products",
      gridArea: "banner4",
      alt: "באנר תחתון רחב"
    }
  ];

  return (
    <div className={styles.middleBannersContainer}>
        <h2 className={styles.yoursProducts}> המיוחדים שלנו</h2>
      <div className={styles.bannersGrid}>
        {banners.map((banner, index) => (
          <Link 
            key={index}
            to={banner.link}
            className={styles[banner.gridArea]}
          >
            <img 
              src={banner.image}
              alt={banner.alt}
              className={styles.bannerImage}
            />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MiddleBanners; 