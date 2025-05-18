// src/components/UploadExcelButton.js
import React, { useRef } from "react";
import axios from "axios";
import styles from "../styles/AdminProducts.module.css";

const UploadExcelButton = ({ onUploadSuccess }) => {
  const fileInputRef = useRef();

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("excelFile", file); // 💡 חייב להיות בדיוק כמו בצד השרת

    try {
      const res = await axios.post("http://localhost:8000/products/admin/upload-excel", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(`✅ ${res.data.message} (${res.data.count} מוצרים הועלו)`);
      onUploadSuccess?.();
    } catch (err) {
      console.error("❌ שגיאה בהעלאת Excel:", err);
      alert("שגיאה בהעלאת קובץ Excel");
    }
  };

  return (
    <>
      <button onClick={triggerFileInput} className={styles.UploadExcelButton}>
        Upload from Excel 📄
      </button>
      <input
        type="file"
        accept=".xlsx, .xls"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </>
  );
};

export default UploadExcelButton;
