import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "../styles/ProductPage.module.css";
import reviewImage from "../assets/reviews.jpg";
import addToCartImage from "../assets/addtocart.jpg";
import SearchStrip from "../components/SearchStrip";
import axios from "axios";

const ProductPage = () => {
  const { sku } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [imageSrc, setImageSrc] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableThumbnails, setAvailableThumbnails] = useState([]);

  const SERVER_URL = "http://localhost:8000";

  useEffect(() => {
    const loadProductImages = async () => {
      if (!sku) return;

      // קובע את התמונה הראשית
      setImageSrc(`/images/${sku}.jpg`);

      // בודק תמונות ממוזערות - רק אם קיימות
      const validThumbnails = [];
      const checkThumbnail = async (index) => {
        try {
          const response = await fetch(`/images/${sku}_${index}.jpg`);
          if (response.ok) {
            validThumbnails.push({
              src: `/images/${sku}_${index}.jpg`,
              alt: `תמונה ${index}`
            });
          }
        } catch (error) {
          console.log(`Thumbnail ${index} not found`);
        }
      };

      // בדיקת קיום הטמבניילס
      await Promise.all([
        checkThumbnail(1),
        checkThumbnail(2),
        checkThumbnail(3)
      ]);

      setAvailableThumbnails(validThumbnails);
    };

    const fetchData = async () => {
      if (!sku) {
        setError("מזהה מוצר חסר");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // שליפת המוצר הספציפי
        const productRes = await axios.get(`${SERVER_URL}/products`, {
          params: { sku: Number(sku) }
        });
        
        if (!productRes.data || (Array.isArray(productRes.data.products) && productRes.data.products.length === 0)) {
          throw new Error("מוצר לא נמצא");
        }

        // אם מקבלים מערך, ניקח את המוצר הראשון שמתאים ל-SKU
        const productData = Array.isArray(productRes.data.products) 
          ? productRes.data.products.find(p => p.sku === Number(sku))
          : productRes.data;

        if (!productData) {
          throw new Error("מוצר לא נמצא");
        }

        setProduct(productData);
        
        // טעינת תמונות רק אחרי שיש לנו את נתוני המוצר
        await loadProductImages();

        // שליפת כל המוצרים לצורך ה-SearchStrip
        try {
          const allProductsRes = await axios.get(`${SERVER_URL}/products`);
          const allProductsData = Array.isArray(allProductsRes.data) ? allProductsRes.data : allProductsRes.data.products || [];
          setAllProducts(allProductsData);
        } catch (err) {
          console.error("שגיאה בטעינת רשימת מוצרים:", err);
        }

      } catch (err) {
        console.error("שגיאה בטעינת נתונים:", err);
        if (err.response?.status === 404) {
          setError("מוצר לא נמצא");
        } else {
          setError(err.message || "שגיאה בטעינת המוצר");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sku]);

  const handleImageError = (e) => {
    const currentSrc = e.target.src;
    if (currentSrc.endsWith('.jpg')) {
      e.target.src = currentSrc.replace('.jpg', '.png');
    } else if (currentSrc.endsWith('.png')) {
      e.target.src = `${SERVER_URL}/images/default.jpg`;
    }
  };

  const handleAddToCart = () => {
    try {
      if (!product) return;

      const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
      const productToAdd = {
        sku: product.sku,
        productName: product.productName,
        price: product.price,
        image: imageSrc,
        quantity: quantity,
      };
      
      const existingItem = existingCart.find((p) => p.sku === sku);
      
      const updatedCart = existingItem
        ? existingCart.map((p) =>
            p.sku === sku ? { ...p, quantity: p.quantity + quantity } : p
          )
        : [...existingCart, productToAdd];
      
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      window.dispatchEvent(new Event("storage"));
      navigate("/cart");
    } catch (error) {
      console.error("שגיאה בהוספה לסל:", error);
      alert("אירעה שגיאה בהוספה לסל");
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        <p>טוען מוצר...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <h2>שגיאה</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/")} className={styles.backButton}>
          חזרה לדף הבית
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.error}>
        <h2>מוצר לא נמצא</h2>
        <button onClick={() => navigate("/")} className={styles.backButton}>
          חזרה לדף הבית
        </button>
      </div>
    );
  }

  return (
    <main className={styles.pageWrapper}>
      <div className={styles.searchStripWrapper}>
        <SearchStrip
          categories={allProducts.map(p => ({
            category: p.category,
            subcategory: p.subcategory,
            subsubcategory: p.subsubcategory
          }))}
        />
      </div>

      <div className={styles.topSection}>
        <div className={styles.imageSection}>
          <div className={styles.imageWrapper}>
            <img
              src={imageSrc}
              alt={product.productName}
              onError={handleImageError}
              className={styles.mainImage}
            />
          </div>

          {availableThumbnails.length > 0 && (
            <div className={styles.thumbnailList}>
              {availableThumbnails.map((thumb, i) => (
                <img
                  key={i}
                  src={thumb.src}
                  alt={thumb.alt}
                  className={styles.thumbnail}
                  onClick={() => setImageSrc(thumb.src)}
                />
              ))}
            </div>
          )}
        </div>

        <div className={styles.details}>
          <img
            src={`/brands/${product.brandLogo?.trim() || "placeholder.jpg"}`}
            alt={product.brand}
            onError={(e) => {
              e.target.src = `/brands/placeholder.jpg`;
            }}
            className={styles.brandLogo}
          />

          <h2 className={styles.name}>{product.productName}</h2>

          <div
            className={styles.shortDescription}
            dangerouslySetInnerHTML={{ __html: product.shortDescription }}
          />

          <div className={styles.priceBox}>
            <span className={styles.price}>
              {(Math.floor(product.price * 10) / 10).toFixed(2)} ₪
            </span>           
            {product.priceInstead && (
              <span className={styles.priceInstead}>{Math.round(product.priceInstead)} ₪</span>
            )}
          </div>

          <div className={styles.actions}>
            <select
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className={styles.quantitySelect}
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
              onClick={handleAddToCart}
              className={styles.addToCart}
              style={{ cursor: 'pointer' }}
            />
          </div>

          <img src={reviewImage} alt="ביקורות" className={styles.review} />

          <p className={styles.metaLine}>
            {product.sku && <>מק"ט: {product.sku} | </>}
            {product.model && <>דגם: {product.model} | </>}
            {product.brand && <>מותג: {product.brand} | </>}
            {product.country && <>ארץ יצור: {product.country} | </>}
            {product.warranty && <>אחריות: {product.warranty}</>}
          </p>
          <p className={styles.caterorylist}>
            {product.category && <> {product.category}</>}
            {product.subcategory && <> / {product.subcategory}</>}
            {product.subsubcategory && <> / {product.subsubcategory}</>}
          </p>
        </div>
      </div>

      {/* תיאור ארוך */}
      <div className={styles.fullDescription}>
        <h2>תיאור מוצר</h2>
        <div dangerouslySetInnerHTML={{ __html: product.longDescription }} />
      </div>
    </main>
  );
};

export default ProductPage;
