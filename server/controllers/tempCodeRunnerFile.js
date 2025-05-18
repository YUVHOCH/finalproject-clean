// server/controlers/productControler.js

const Product = require('../models/Product');
const fs = require("fs");
const path = require("path");

// 🔴 מוחק את כל המוצרים מה־MongoDB
const deleteAllProducts = async (req, res) => {
  try {
    await Product.deleteMany({});
    res.status(200).json({ message: "🗑️ All products deleted" });
  } catch (error) {
    console.error("❌ Error deleting products:", error);
    res.status(500).json({ error: "Failed to delete products" });
  }
};

// 🟢 טוען מוצרים מתוך הקובץ JSON ומעלה למסד
const uploadProductsFromJson = async (req, res) => {
  try {
    const filePath = path.join(__dirname, "..", "data", "products.json");
    const fileData = fs.readFileSync(filePath, "utf8");
    const products = JSON.parse(fileData);

    if (!Array.isArray(products)) {
      return res.status(400).json({ error: "Invalid product format" });
    }

    await Product.insertMany(products);
    res.status(201).json({ message: "✅ Products uploaded", count: products.length });
  } catch (error) {
    console.error("❌ Error uploading products:", error);
    res.status(500).json({ error: "Failed to upload products" });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addProducts = async (req, res) => {
  try {
    const data = req.body;

    // בדיקה אם זה מערך
    if (!Array.isArray(data)) {
      return res.status(400).json({ message: "Request body must be an array of products" });
    }

    const result = await Product.insertMany(data);
    res.status(201).json({ message: "✅ Products added successfully", result });
  } catch (error) {
    console.error("❌ Error adding products:", error.message);
    res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
    console.log("📌 DELETE endpoint hit with SKU:", req.params.sku);
    try {
    const sku = parseInt(req.params.sku); // 👈 ממיר למספר
    const result = await Product.findOneAndDelete({ sku });
  
      if (!result) {
        return res.status(404).json({ message: "Product not found" });
      }
  
      res.json({ message: `Product with SKU ${sku} deleted successfully` });
    } catch (error) {
      console.error("❌ Error deleting product:", error.message);
      res.status(500).json({ message: error.message });
    }
  };

  const updateProduct = async (req, res) => {
    const { sku } = req.params;
    const updatedProduct = req.body;
  
    try {
      const result = await Product.findOneAndUpdate(
        { sku },
        { $set: updatedProduct },
        { new: true }
      );
  
      if (!result) {
        return res.status(404).json({ message: "Product not found" });
      }
  
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  

module.exports = {
  deleteAllProducts,
  uploadProductsFromJson,
  getAllProducts,
  addProducts,
  deleteProduct,
  updateProduct
};
