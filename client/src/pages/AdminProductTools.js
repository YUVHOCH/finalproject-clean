// src/pages/AdminProductTools.js
import React from "react";
import productsData from "../data/products.json";
import UploadExcelButton from "../components/UploadExcelButton";


const AdminProductTools = () => {
  const handleDeleteAll = async () => {
    if (!window.confirm("Are you sure you want to delete all products?")) return;

    try {
      const res = await fetch("http://localhost:8000/products/delete-all", {
        method: "DELETE",
      });

      if (res.ok) {
        alert("✅ All products deleted successfully.");
      } else {
        alert("❌ Failed to delete products.");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      alert("❌ Server error");
    }
  };

  const handleUploadJson = async () => {
    try {
      const res = await fetch("http://localhost:8000/products/upload-json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productsData),
      });

      if (res.ok) {
        alert("✅ Products uploaded successfully.");
      } else {
        alert("❌ Upload failed.");
      }
    } catch (err) {
      console.error("❌ Error:", err);
      alert("❌ Server error");
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Admin Product Tools</h2>
      <button onClick={handleDeleteAll} style={{ marginRight: "20px" }}>
        🗑️ Delete All Products
      </button>
      <button onClick={handleUploadJson}>⬆️ Upload from JSON</button>
      <UploadExcelButton onUploadSuccess={handleUploadSuccess} />
    </div>
  );
};

export default AdminProductTools;