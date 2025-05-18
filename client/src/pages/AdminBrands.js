import React, { useState, useEffect } from 'react';
import styles from '../styles/AdminBrands.module.css';

function AdminBrands() {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    fetchBrandsData();
  }, []);

  const fetchBrandsData = async () => {
    try {
      const response = await fetch('http://localhost:8000/brands');
      const data = await response.json();
      const sortedData = data.sort((a, b) => (a.position || 0) - (b.position || 0));
      setBrands(sortedData);
    } catch (error) {
      console.error('Error fetching brands data:', error);
    }
  };

  const moveItem = async (index, direction) => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === brands.length - 1)
    ) return;

    const newBrands = [...brands];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    // החלפת מיקומים
    [newBrands[index], newBrands[newIndex]] = [newBrands[newIndex], newBrands[index]];
    
    // עדכון מספרי המיקום
    const updatedBrands = newBrands.map((brand, idx) => ({
      ...brand,
      position: idx + 1
    }));

    setBrands(updatedBrands);

    try {
      const response = await fetch('http://localhost:8000/brands/positions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ brands: updatedBrands }),
      });

      if (!response.ok) {
        throw new Error('Failed to update positions');
      }
    } catch (error) {
      console.error('Error updating positions:', error);
      alert('שגיאה בעדכון המיקומים');
    }
  };

  const handleSaveBrand = async (brand) => {
    try {
      const response = await fetch('http://localhost:8000/brands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(brand),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.message) {
        alert('✅ ' + data.message);
      }

      if (data.brand) {
        setBrands(prevBrands => 
          prevBrands.map(b => b.name === data.brand.name ? data.brand : b)
        );
      }
    } catch (err) {
      console.error('❌ שגיאה בשמירת נתוני המותג:', err);
      alert('❌ שגיאה בשמירת נתוני המותג');
    }
  };

  return (
    <div>
      <h2>🏷️ ניהול מותגים</h2>

      <table className={styles.brandsTable}>
        <thead className={styles.tableHeader}>
          <tr>
            <th className={`${styles.tableHeaderCell} ${styles.positionCell}`}>מיקום</th>
            <th className={`${styles.tableHeaderCell} ${styles.orderCell}`}>סדר</th>
            <th className={`${styles.tableHeaderCell} ${styles.brandNameCell}`}>שם המותג</th>
            <th className={styles.tableHeaderCell}>כותרת</th>
            <th className={styles.tableHeaderCell}>תיאור</th>
            <th className={styles.tableHeaderCell}>תצוגה מקדימה</th>
            <th className={styles.tableHeaderCell}>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {brands.map((brand, index) => (
            <tr key={brand.name}>
              <td className={`${styles.tableCell} ${styles.positionCell}`}>
                {index + 1}
              </td>
              <td className={`${styles.tableCell} ${styles.orderCell}`}>
                <div>
                  <button
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0}
                    className={`${styles.orderButton} ${
                      index === 0 ? styles.orderButtonDisabled : styles.orderButtonEnabled
                    }`}
                  >
                    ⬆️
                  </button>
                  <button
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === brands.length - 1}
                    className={`${styles.orderButton} ${
                      index === brands.length - 1 ? styles.orderButtonDisabled : styles.orderButtonEnabled
                    }`}
                  >
                    ⬇️
                  </button>
                </div>
              </td>
              <td className={`${styles.tableCell} ${styles.brandNameCell}`}>
                {brand.name}
                <img 
                  src={`/brandspage/${brand.name}.jpg`}
                  alt={brand.name}
                  className={styles.brandImage}
                />
              </td>
              <td className={styles.tableCell}>
                <input
                  type="text"
                  value={brand.title || ''}
                  onChange={(e) => {
                    setBrands(prevBrands => {
                      const newBrands = [...prevBrands];
                      newBrands[index] = { ...newBrands[index], title: e.target.value };
                      return newBrands;
                    });
                  }}
                  className={styles.inputField}
                />
              </td>
              <td className={styles.tableCell}>
                <textarea
                  value={brand.description || ''}
                  onChange={(e) => {
                    setBrands(prevBrands => {
                      const newBrands = [...prevBrands];
                      newBrands[index] = { ...newBrands[index], description: e.target.value };
                      return newBrands;
                    });
                  }}
                  className={styles.textareaField}
                />
              </td>
              <td className={`${styles.tableCell} ${styles.previewCell}`}>
                <strong className={styles.previewTitle}>{brand.title}</strong>
                <p className={styles.previewDescription}>{brand.description}</p>
              </td>
              <td className={`${styles.tableCell} ${styles.actionCell}`}>
                <button 
                  onClick={() => handleSaveBrand(brand)}
                  className={styles.saveButton}
                >
                  שמור
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminBrands; 