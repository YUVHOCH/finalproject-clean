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
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResults(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/ai-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: query.trim()
        }),
      });
      
      if (!response.ok) {
        throw new Error(`שגיאה בחיפוש: ${response.status}`);
      }

      const data = await response.json();
      if (!data.products?.length) {
        setError('לא נמצאו תוצאות מתאימות לחיפוש שלך');
        return;
      }
      
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
                <p>לא נמצאו תוצאות מתאימות לחיפוש שלך</p>
                <p className={styles.searchTips}>
                  ניסינו לחפש:
                  {results.analysis && (
                    <ul>
                      <li>בקטגוריה: {results.analysis.mainCategory}</li>
                      <li>סוג מוצר: {results.analysis.productType}</li>
                      <li>עם הדרישות: {results.analysis.requirements?.join(', ')}</li>
                    </ul>
                  )}
                  <br />
                  טיפים לחיפוש:
                  <ul>
                    <li>נסה לתאר את המוצר בצורה כללית יותר</li>
                    <li>ציין את השימוש העיקרי של המוצר</li>
                    <li>נסה לחפש לפי קטגוריה</li>
                  </ul>
                </p>
              </div>
            ) : (
              <>
                <div className={styles.resultsHeader}>
                  נמצאו {results.products.length} תוצאות עבור "{results.query}"
                </div>
                {results.products.map((product, index) => (
                  <Link 
                    to={`/product/${product.sku}`} 
                    key={index} 
                    className={styles.resultItem}
                    onClick={onClose}
                  >
                    <div className={styles.imageContainer}>
                      <img 
                        src={`/images/${product.sku}.jpg`}
                        alt={product.productName || 'מוצר'}
                        className={styles.productImage}
                        onError={handleImageError}
                      />
                    </div>
                    <div className={styles.productInfo}>
                      <h3>{product.productName}</h3>
                      <div className={styles.categories}>
                        {product.category && <span>{product.category}</span>}
                        {product.subcategory && <span>{product.subcategory}</span>}
                      </div>
                      {product.brand && (
                        <div className={styles.brand}>{product.brand}</div>
                      )}
                      <p className={styles.description}>
                        {product.shortDescription || ''}
                      </p>
                      <p className={styles.price}>
                        {typeof product.price === 'number' && !isNaN(product.price) 
                          ? `₪${product.price.toLocaleString('he-IL', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}`
                          : 'מחיר לא זמין'
                        }
                      </p>
                    </div>
                  </Link>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AISearchModal; 