import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "../styles/ShippingMethod.module.css";

const ShippingMethod = ({ selected, onSelect, cartItems }) => {
  const [stores, setStores] = useState([]);
  const [hasWarehouseStock, setHasWarehouseStock] = useState(false);

  // בדיקת מלאי במרלו"ג וטעינת סניפים
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/stores");
        const storesData = response.data;
        setStores(storesData);

        // בדיקה אם יש מרלו"ג ברשימת החנויות
        const warehouse = storesData.find(store => store.storeId === "3");
        setHasWarehouseStock(warehouse?.isActive || false);
      } catch (error) {
        console.error("שגיאה בטעינת סניפים:", error);
        setStores([]);
      }
    };

    fetchStores();
  }, []);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>בחר/י שיטת משלוח:</h3>
      <div className={styles.buttons}>
        {hasWarehouseStock && (
          <>
            <button
              className={selected === "delivery" ? styles.active : ""}
              onClick={() => onSelect("delivery")}
            >
              משלוח עם שליח
            </button>
            <button
              className={selected === "pickup_point" ? styles.active : ""}
              onClick={() => onSelect("pickup_point")}
            >
               נקודות איסוף/לוקרים
            </button>
          </>
        )}
        <button
          className={selected === "self" ? styles.active : ""}
          onClick={() => onSelect("self")}
        >
          איסוף מהסניפים
        </button>
      </div>

      {/* רשימת סניפים */}
      {selected === "self" && stores.length > 0 && (
        <div className={styles.storesList}>
          <select 
            className={styles.storeSelect}
            onChange={(e) => onSelect("self", e.target.value)}
          >
            <option value="">בחר/י סניף לאיסוף</option>
            {stores
              .filter(store => store.isActive)
              .map(store => (
                <option key={store.storeId} value={store.storeId}>
                  {store.storeName} - {store.storeAddress}
                </option>
              ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default ShippingMethod;
