import React, { useState, useEffect } from 'react';
import { getProductImages } from '../services/imageService';
import styles from '../styles/ProductImages.module.css';

const ProductImages = ({ sku }) => {
  const [images, setImages] = useState({ main: null, thumbnails: [] });
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (sku) {
      const productImages = getProductImages(sku);
      setImages(productImages);
      setSelectedImage(productImages.main);
    }
  }, [sku]);

  if (!images.main) {
    return <div className={styles.noImage}>תמונה לא זמינה</div>;
  }

  return (
    <div className={styles.productImages}>
      <div className={styles.mainImage}>
        <img 
          src={selectedImage || images.main} 
          alt="תמונת מוצר"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/no-image.jpg';
          }}
        />
      </div>
      
      {images.thumbnails.length > 0 && (
        <div className={styles.thumbnails}>
          {images.thumbnails.map((thumb, index) => (
            <div 
              key={index}
              className={`${styles.thumbnail} ${selectedImage === thumb ? styles.active : ''}`}
              onClick={() => setSelectedImage(thumb)}
            >
              <img 
                src={thumb} 
                alt={`תמונה ${index + 1}`}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/no-image.jpg';
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImages; 