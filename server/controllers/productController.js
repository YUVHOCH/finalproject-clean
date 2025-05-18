// server/controllers/productController.js
const Product = require('../models/Product');
const Category = require('../models/Category');

// פונקציה חדשה להמרת מוצר למבנה החדש
const convertProductToNewStructure = async (product) => {
  try {
    // מחפשים את הקטגוריה המתאימה לפי השדות הישנים
    let category = null;
    
    if (product.subsubcategory) {
      // אם יש תת-תת קטגוריה, נחפש אותה לפי השם
      category = await Category.findOne({ 
        categoryName: product.subsubcategory,
        categoryLevel: 3
      });
    } else if (product.subcategory) {
      // אם יש תת קטגוריה, נחפש אותה לפי השם
      category = await Category.findOne({ 
        categoryName: product.subcategory,
        categoryLevel: 2
      });
    } else if (product.category) {
      // אם יש רק קטגוריה ראשית, נחפש אותה
      category = await Category.findOne({ 
        categoryName: product.category,
        categoryLevel: 1
      });
    }

    if (category) {
      // מעדכנים את המוצר עם ה-ID של הקטגוריה שמצאנו
      await Product.findByIdAndUpdate(product._id, {
        categoryId: category.categoryId
      });
    }

    return category?.categoryId || null;
  } catch (error) {
    console.error('Error converting product structure:', error);
    return null;
  }
};

// פונקציה להמרת כל המוצרים למבנה החדש
const migrateAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    let success = 0;
    let failed = 0;

    for (const product of products) {
      let categoryToAssign = null;

      // מחפשים את הקטגוריה המתאימה לפי הרמה העמוקה ביותר
      if (product.subsubcategory) {
        categoryToAssign = await Category.findOne({
          categoryName: product.subsubcategory,
          categoryLevel: 3
        });
      }
      
      if (!categoryToAssign && product.subcategory) {
        categoryToAssign = await Category.findOne({
          categoryName: product.subcategory,
          categoryLevel: 2
        });
      }
      
      if (!categoryToAssign && product.category) {
        categoryToAssign = await Category.findOne({
          categoryName: product.category,
          categoryLevel: 1
        });
      }

      if (categoryToAssign) {
        await Product.findByIdAndUpdate(product._id, {
          categoryId: categoryToAssign.categoryId
        });
        success++;
      } else {
        failed++;
      }
    }

    res.json({
      message: 'המרת קטגוריות הושלמה',
      results: { success, failed, total: products.length }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// עדכון הפונקציה הקיימת getAllProducts
const getAllProducts = async (req, res) => {
  try {
    const search = req.query.search?.toLowerCase() || "";
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : null;

    // בדיקה אם המידע קיים במטמון
    const cacheKey = `products_${search}_${categoryId}`;
    const cache = req.app.get('cache');
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      return res.json(cachedData);
    }

    // שליפת קטגוריות רק אם צריך
    let categories = [];
    if (categoryId) {
      try {
        categories = await Category.find({}, { categoryId: 1, categoryName: 1, _id: 0 }).lean();
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    }

    const query = {};
    if (search) {
      const skuAsNumber = Number(search);
      const skuCondition = !isNaN(skuAsNumber) ? { sku: skuAsNumber } : null;
      query.$or = [
        { productName: new RegExp(search, "i") },
        { brand: new RegExp(search, "i") },
        ...(skuCondition ? [skuCondition] : [])
      ];
    }

    if (categoryId) {
      query.categoryId = categoryId;
    }

    // הוספת projection לשליפת שדות נדרשים בלבד
    const projection = {
      shortEmb: 0,
      longEmb: 0,
      __v: 0
    };

    const products = await Product.find(query, projection)
      .sort({ position: 1, dateCreation: -1 })
      .lean();

    // הוספת מידע על קטגוריות רק אם צריך
    const productsWithCategories = categoryId ? products.map(product => {
      const category = categories.find(cat => cat.categoryId === product.categoryId);
      return {
        ...product,
        categoryName: category ? category.categoryName : null
      };
    }) : products;
    
    const responseData = {
      products: productsWithCategories || [],
      categories: categories || []
    };

    // שמירה במטמון
    cache.set(cacheKey, responseData);
    
    res.json(responseData);

  } catch (err) {
    console.error("❌ Error in getAllProducts:", err);
    res.status(500).json({ 
      message: "Server error", 
      products: [],
      categories: []
    });
  }
};

// ➕ הוספת מוצרים חדשים (POST /products)
const addProducts = async (req, res) => {
  try {
    const data = req.body;
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

// ❌ מחיקת מוצר לפי SKU (DELETE /products/:sku)
const deleteProduct = async (req, res) => {
  try {
    const sku = parseInt(req.params.sku);
    const result = await Product.findOneAndDelete({ sku });
    if (!result) return res.status(404).json({ message: "Product not found" });
    res.json({ message: `Product with SKU ${sku} deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✏️ עדכון מוצר לפי SKU (PUT /products/:sku)
const updateProduct = async (req, res) => {
  const { sku } = req.params;
  const updatedProduct = req.body;
  try {
    const result = await Product.findOneAndUpdate({ sku }, { $set: updatedProduct }, { new: true });
    if (!result) return res.status(404).json({ message: "Product not found" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🧨 מחיקת כל המוצרים (DELETE /products/admin/delete-all)
const deleteAllProducts = async (req, res) => {
  try {
    await Product.deleteMany({});
    res.status(200).json({ message: "🗑️ All products deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete products" });
  }
};

// 🆔 עדכון שדה model בלבד
const updateModels = async (req, res) => {
  try {
    const xlsx = require("xlsx");
    const rows = xlsx.utils.sheet_to_json(
      xlsx.read(req.file.buffer, { type: "buffer" }).Sheets["Sheet1"]
    );

    const updateResults = [];

    for (const row of rows) {
      if (!row.sku || !row["Model Code"]) continue;

      const updated = await Product.findOneAndUpdate(
        { sku: row.sku },
        { model: row["Model Code"] },
        { new: true }
      );

      updateResults.push({
        sku: row.sku,
        model: row["Model Code"],
        status: updated ? "updated" : "not found"
      });
    }

    res.status(200).json({ message: "Models updated", results: updateResults });
  } catch (err) {
    console.error("❌ Error updating models:", err.message);
    res.status(500).json({ message: "Error updating models", error: err.message });
  }
};

module.exports = {
  getAllProducts,
  addProducts,
  deleteProduct,
  updateProduct,
  deleteAllProducts,
  updateModels,
  migrateAllProducts,
  convertProductToNewStructure
};
