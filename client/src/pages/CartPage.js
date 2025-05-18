// src/pages/CartPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/CartPage.module.css";
import SearchStrip from "../components/SearchStrip";
import ShippingMethod from "../components/ShippingMethod";
import { Link, useNavigate } from "react-router-dom"; // ודא שזה נמצא למעלה בקובץ

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // 🔄 לשליפת קטגוריות ל־SearchStrip
  const [shippingMethod, setShippingMethod] = useState("delivery");
  const [selectedStore, setSelectedStore] = useState("");
  const navigate = useNavigate();

  // שליפת מוצרים לעיבוד קטגוריות
  useEffect(() => {
    axios.get("http://localhost:8000/products")
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data.products || [];
        setAllProducts(data);
      })
      .catch(err => {
        console.error("שגיאה בטעינת מוצרים ל־SearchStrip", err);
        setAllProducts([]);
      });
  }, []);

  // שליפת סל מקומי
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("cart");
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        // וידוא שכל פריט בעגלה מכיל את כל השדות הנדרשים
        const validCart = parsedCart.map(item => ({
          ...item,
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          sku: item.sku || '',
          productName: item.productName || 'מוצר לא ידוע'
        }));
        setCartItems(validCart);
      }
    } catch (error) {
      console.error("שגיאה בטעינת העגלה:", error);
      setCartItems([]);
    }
  }, []);

  const handleQuantityChange = (sku, newQuantity) => {
    const updatedCart = cartItems.map(item =>
      item.sku === sku ? { ...item, quantity: Number(newQuantity) || 1 } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const totalPrice = cartItems.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 1;
    return sum + (price * quantity);
  }, 0);

  const handleRemove = (sku) => {
    const updatedCart = cartItems.filter(item => item.sku !== sku);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("storage"));
  };

  const handleShippingMethodChange = (method, storeId = "") => {
    setShippingMethod(method);
    setSelectedStore(storeId);
  };

  const getShippingCost = () => {
    switch (shippingMethod) {
      case "delivery": return 39;
      case "pickup_point": return 19;
      case "self": return 0;
      default: return 0;
    }
  };

  const shippingCost = getShippingCost();
  const totalWithShipping = totalPrice + shippingCost;

  // אם אין פריטים בעגלה, נציג הודעה מתאימה
  if (cartItems.length === 0) {
    return (
      <main className={styles.cartWrapper}>
        <SearchStrip
          categories={allProducts.map(p => ({
            category: p.category,
            subcategory: p.subcategory,
            subsubcategory: p.subsubcategory
          }))}
        />
        <h2 className={styles.cartTitle}>עגלת קניות</h2>
        <div className={styles.emptyCart}>
          <p>העגלה שלך ריקה</p>
          <button onClick={() => navigate('/')} className={styles.continueShoppingButton}>
            המשך בקניות
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.cartWrapper}>
      {/* 🔍 פס חיפוש למעלה */}
      <SearchStrip
        categories={allProducts.map(p => ({
          category: p.category,
          subcategory: p.subcategory,
          subsubcategory: p.subsubcategory
        }))}
      />

      <h2 className={styles.cartTitle}>עגלת קניות</h2>

      <ShippingMethod 
        selected={shippingMethod} 
        onSelect={handleShippingMethodChange}
        cartItems={cartItems}
      />

      <Link to="/shippingpolicy" className={styles.shippingPolicyLink}>
  מדיניות משלוחים ואספקה <span className={styles.arrow}>&raquo;</span>
</Link>

      <div className={styles.cartContent}>
        {/* עמודת טבלת המוצרים */}
        <div className={styles.productTable}>
          <table>
            <thead>
            <tr>
                <th></th> {/* תמונה */}
                <th>תיאור</th>
                <th>מחיר</th>
                <th>כמות</th>
                <th>סה״כ</th>
                <th></th> {/* דליט */}
            </tr>
            </thead>
            <tbody>
                {cartItems.map((item) => (
                    <tr key={item.sku} className={styles.tableRow}>

                    {/* תמונה מימין */}
                    <td className={styles.imageCell}>
                        <img
                        src={`/images/${item.sku}.jpg`}
                        alt={item.productName}
                        className={styles.productImage}
                        onError={(e) => {
                          e.target.src = '/images/default.jpg';
                        }}
                        />
                    </td>

                    {/* תיאור ומק״ט */}
                    <td className={styles.descriptionCell}>
                        <div className={styles.productName}>{item.productName}</div>
                        <div className={styles.sku}>מק״ט: {item.sku}</div>
                    </td>

                    {/* מחיר */}
                    <td className={styles.priceCell}>
                        {(Number(item.price) || 0).toFixed(2)} ₪
                    </td>

                    {/* כמות */}
                    <td className={styles.quantityCell}>
                        <select
                        value={item.quantity}
                        onChange={(e) =>
                            handleQuantityChange(item.sku, parseInt(e.target.value))
                        }
                        >
                        {[...Array(10)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                            {i + 1}
                            </option>
                        ))}
                        </select>
                    </td>

                    {/* סה״כ */}
                    <td className={styles.totalCell}>
                        {((Number(item.price) || 0) * (Number(item.quantity) || 1)).toFixed(2)} ₪
                    </td>
                     {/* X מחיקה - בצד שמאל של כל שורה */}
                     <td className={styles.removeCell}>
                        <button
                        className={styles.removeButton}
                        onClick={() => handleRemove(item.sku)}
                        >
                        ✖
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
          </table>
        </div>

        {/* עמודת סיכום עגלה */}
        <div className={styles.summaryBox}>
            {/* רקע אפרפר - סיכום כספי */}
            <div className={styles.totalsSection}>
                <h3>סיכום עגלה</h3>
                <div className={styles.summaryLine}>
                <span>סכום מוצרים</span>
                <strong>{totalPrice.toFixed(2)} ₪</strong>
                </div>

                <div className={styles.summaryLine}>
                <span>עלות משלוח</span>
                <strong>{shippingCost.toFixed(2)} ₪</strong>
                </div>

                <div className={`${styles.summaryLine} ${styles.totalRow}`}>
                <span>סה״כ</span>
                <strong>{totalWithShipping.toFixed(2)} ₪</strong>
                </div>
            </div>

                {/* רקע לבן - קופון + כפתורי תשלום */}
                <div className={styles.actionsSection}>
                <div className={styles.couponBox}>
                <input type="text" placeholder="יש לי קופון.." />
                </div>

                <button 
                  className={styles.payButton}
                  onClick={() => navigate('/checkout')}
                >
                  תשלום אורח
                </button>
                <button className={styles.registeredPayButton}>תשלום לרשומים</button>
            </div>
        </div>
      </div>
    </main>
  );
};

export default CartPage;
