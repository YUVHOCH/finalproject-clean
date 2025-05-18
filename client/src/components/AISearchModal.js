import React, { useState } from 'react';
import styles from '../styles/AISearchModal.module.css';
import { FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const AISearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResults(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/ai-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error during AI search:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // פונקציה להסרת תגיות HTML
  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // פונקציה לטיפול בשגיאת טעינת תמונה
  const handleImageError = (e) => {
    e.target.onerror = null; // מונע לולאה אינסופית
    e.target.src = '/images/default.jpg'; // תמונת ברירת מחדל
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          <FaTimes />
        </button>
        
        <h2>חיפוש חכם באמצעות AI</h2>
        
        <form onSubmit={handleSubmit} className={styles.searchForm}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="תאר/י את המוצר שאת/ה מחפש/ת..."
            className={styles.searchInput}
            dir="rtl"
          />
          <button 
            type="submit" 
            className={styles.searchButton}
            disabled={isLoading}
          >
            {isLoading ? 'מחפש...' : 'חפש'}
          </button>
        </form>

        {error && (
          <div className={styles.error}>
            שגיאה: {error}
          </div>
        )}

        {results?.products && (
          <div className={styles.results}>
            {results.products.length === 0 ? (
              <div className={styles.noResults}>
                לא נמצאו תוצאות לחיפוש שלך
              </div>
            ) : (
              results.products.map((product, index) => (
                <Link 
                  to={`/product/${product.sku}`} 
                  key={index} 
                  className={styles.resultItem}
                  onClick={onClose}
                >
                  <div className={styles.imageContainer}>
                    <img 
                      src={`/images/${product.sku}.jpg`}
                      alt={stripHtml(product.productName)}
                      className={styles.productImage}
                      onError={handleImageError}
                    />
                  </div>
                  <div className={styles.productInfo}>
                    <h3>{stripHtml(product.productName)}</h3>
                    {product.brand && (
                      <div className={styles.brand}>{stripHtml(product.brand)}</div>
                    )}
                    <p className={styles.description}>
                      {stripHtml(product.shortDescription || '')}
                    </p>
                    <p className={styles.price}>
                      ₪{Number(product.price).toLocaleString('he-IL', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AISearchModal; 