import React, { useState } from 'react';
import styles from '../styles/Categories.module.css';

const Categories = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileUpload = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      setLoading(true);
      setMessage('');

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/api/categories/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('הקטגוריות הועלו בהצלחה!');
      } else {
        throw new Error(data.message || 'שגיאה בהעלאת הקובץ');
      }
    } catch (error) {
      setMessage(`שגיאה: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Admin: Categories Management 📑</h1>
      
      <div className={styles.uploadSection}>
        <input
          type="file"
          accept=".xlsx,.xls"
          style={{ display: 'none' }}
          id="excel-upload"
          onChange={handleFileUpload}
        />
        
        <label htmlFor="excel-upload">
          <button 
            className={`${styles.uploadButton} ${loading ? styles.loading : ''}`}
            disabled={loading}
          >
            📥 Upload from Excel
          </button>
        </label>

        {loading && <p>מעלה קובץ...</p>}
        {message && <p className={message.includes('שגיאה') ? styles.error : styles.success}>{message}</p>}
      </div>
    </div>
  );
};

export default Categories; 