// ✅ src/components/ProductCard.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/ProductCard.module.css";
import reviewImage from "../assets/reviews.jpg";
import addToCartImage from "../assets/addtocart.jpg";
import { useNavigate } from "react-router-dom";

const ProductCard = ({
  sku,
  productName,
  brand,
  brandLogo,
  model,
  price,
  priceInstead,
  image,
  shortDescription,
  longDescription,
  country,
  warranty,
  className,
  isSale,
  homeSaleProducts,
  isSalesPage,
}) => {
  const navigate = useNavigate();
  const [imageSrc, setImageSrc] = useState(`/images/${sku}.jpg`);
  const [logoSrc, setLogoSrc] = useState(`/brands/${brandLogo?.trim() || "placeholder.jpg"}`);
  const [availableThumbnails, setAvailableThumbnails] = useState([]);

  useEffect(() => {
    // בדיקת קיום תמונות ממוזערות
    const checkThumbnail = async (index) => {
      try {
        const response = await fetch(`/images/${sku}_${index}.jpg`);
        if (response.ok) {
          return `/images/${sku}_${index}.jpg`;
        }
        const pngResponse = await fetch(`/images/${sku}_${index}.png`);
        if (pngResponse.ok) {
          return `/images/${sku}_${index}.png`;
        }
        return null;
      } catch {
        return null;
      }
    };

    const loadThumbnails = async () => {
      const thumbnailPromises = [1, 2, 3].map(index => checkThumbnail(index));
      const results = await Promise.all(thumbnailPromises);
      setAvailableThumbnails(results.filter(thumb => thumb !== null));
    };

    loadThumbnails();
  }, [sku]);

  const handleImageError = () => {
    if (imageSrc.endsWith(".jpg")) {
      setImageSrc(`/images/${sku}.png`);
    } else {
      setImageSrc("/images/default.jpg");
    }
  };

  const handleLogoError = () => {
    if (logoSrc.endsWith(".jpg")) {
      setLogoSrc(logoSrc.replace(".jpg", ".png"));
    } else {
      setLogoSrc("/brands/placeholder.jpg");
    }
  };

  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const handleAddToCart = () => {
    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    const productToAdd = {
      sku,
      productName,
      price,
      image: imageSrc, 
      quantity: selectedQuantity,
    };
    
    const existingItem = existingCart.find((p) => p.sku === sku);

    const updatedCart = existingItem
      ? existingCart.map((p) =>
          p.sku === sku ? { ...p, quantity: p.quantity + selectedQuantity } : p
        )
      : [...existingCart, productToAdd];
      
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("storage"));
    navigate("/cart");
  };

  return (
    <div className={`${styles.card} ${isSalesPage ? styles.salesPageCard : ''} ${className || ''}`}>
      {/* פלאח מבצע */}
      {(isSale || homeSaleProducts) && (
        <div className={styles.flachContainer} style={{ zIndex: 2 }}>
          <img
            src="/flach/sale.gif"
            alt="מבצע"
            className={styles.flachImage}
          />
        </div>
      )}

      {/* 🖼 תמונה ראשית מימין */}
      <div className={styles.imageSection}>
        <div className={styles.imageWrapper}>
          <img
            src={imageSrc}
            alt={productName}
            className={styles.mainImage}
            onError={handleImageError}
          />
        </div>

        {availableThumbnails.length > 0 && (
          <div className={styles.thumbnailList}>
            {availableThumbnails.map((thumb, idx) => (
              <img
                key={idx}
                src={thumb}
                alt={`תמונה ${idx + 1}`}
                className={styles.thumbnail}
                onClick={() => setImageSrc(thumb)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ℹ️ תוכן משמאל */}
      <div className={styles.details}>
        <img
          src={logoSrc}
          alt={brand || "Brand logo"}
          className={styles.brandLogo}
          onError={handleLogoError}
        />

        <Link to={`/product/${sku}`} className={styles.productLink}>
          <h3 className={styles.name}>{productName}</h3>
        </Link>

        <div
          className={styles.shortDescription}
          dangerouslySetInnerHTML={{ __html: shortDescription }}
        />

        <div className={styles.priceBox}>
          <span className={styles.price}>{Math.round(price)} ₪</span>
          {priceInstead && (
            <span className={styles.priceInstead}>{Math.round(priceInstead)} ₪</span>
          )}
        </div>

        <div className={styles.actions}>
          <select
            className={styles.quantitySelect}
            value={selectedQuantity}
            onChange={(e) => setSelectedQuantity(parseInt(e.target.value))}
          >
            {[...Array(10)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>

          <img 
            src={addToCartImage}
            alt="הוסף לסל"
            className={styles.addToCartButton}
            onClick={handleAddToCart}
          />
          
          <Link to={`/product/${sku}`} className={styles.detailsButton}>
            לפרטים
          </Link>
        </div>

        <img src={reviewImage} alt="ביקורות" className={styles.review} />
        <p className={styles.metaLine}>
          {sku && <>מק"ט: {sku} | </>}
          {model && <>דגם: {model} | </>}
          {brand && <>מותג: {brand} | </>}
          {country && <>ארץ יצור: {country} | </>}
          {warranty && <>אחריות: {warranty}</>}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;
