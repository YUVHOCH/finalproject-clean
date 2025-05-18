// components/Sidebar.js
import React from "react";
import styles from "../styles/Sidebar.module.css";

const Sidebar = ({ onSelectCategory, className = "" }) => {
  
  const categories = {
    "Garden Tools": ["Lawnmowers", "Chainsaws", "Blowers", "Trimmers"],
    "Irrigation": ["Water Controls", "Real Hoses", "Flexible Hoses"],
    "Fertilising": ["Liquid", "Solid"],
    "Pest Control": ["Organic", "Mineral"]
  };

  return (
<div className={`${styles.sidebarContainer} ${className}`}>
      <h3>Categories:</h3>
      {Object.entries(categories).map(([group, items]) => (
        <div key={group} className={styles.categoryGroup}>
          <h4>{group}</h4>
          <ul>
            {items.map((cat) => (
              <li key={cat}>
                <button
                  className={styles.categoryButton}
                  onClick={() => onSelectCategory(cat)}
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <button className={styles.clearButton} onClick={() => onSelectCategory("")}>
        Clear Filter
      </button>
    </div>
  );
};

export default Sidebar;
