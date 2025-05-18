// 🛣️ Product Routes – ניהול נתיבים למוצרים
// server\routes\products.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const multer = require("multer");
const xlsx = require("xlsx");

const {
  getAllProducts,
  addProducts,
  deleteProduct,
  updateProduct,
  deleteAllProducts,
  migrateAllProducts,
  updateProductPosition
} = require('../controllers/productController');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// 🔁 שליפת מוצר לפי SKU
router.get('/sku/:sku', async (req, res) => {
  try {
    const sku = req.params.sku;
    const projection = {
      shortEmb: 0,
      longEmb: 0,
      __v: 0
    };
    
    const product = await Product.findOne({ sku }, projection).lean();
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error("❌ Error fetching product:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 📊 שליפת מספר מוצרים פעילים לפי תת-תת-קטגוריה
router.get("/category-counts", async (req, res) => {
  try {
    const result = await Product.aggregate([
      { $match: { active: true } },
      {
        $group: {
          _id: "$subsubcategory",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});


// 🔄 נתיבים רגילים
router.get('/', getAllProducts);

// 📦 שליפת מוצרים לפי קטגוריה
router.get('/by-category/:categoryId', async (req, res) => {
  try {
    const categoryId = Number(req.params.categoryId);
    
    if (isNaN(categoryId)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    // בדיקה במטמון
    const cache = req.app.get('cache');
    const cacheKey = `category_${categoryId}_products`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      return res.json(cachedData);
    }

    // מצא את הקטגוריה וכל תתי הקטגוריות שלה בשאילתה אחת
    const categories = await Category.find({
      $or: [
        { categoryId },
        { parentId: categoryId }
      ],
      isActive: true
    })
    .select('categoryId categoryName categoryLevel parentId position slug description isActive')
    .lean();

    if (!categories.length) {
      return res.status(404).json({ message: 'Category not found or inactive' });
    }

    const categoryIds = categories.map(cat => cat.categoryId);

    // שליפת המוצרים בשאילתה אחת
    const products = await Product.find(
      {
        categoryId: { $in: categoryIds },
        active: true
      },
      {
        shortEmb: 0,
        longEmb: 0,
        __v: 0
      }
    )
    .sort({ position: 1, dateCreation: -1 })
    .lean();

    const responseData = {
      category: categories[0],
      products,
      total: products.length
    };

    // שמירה במטמון ל-2 דקות
    cache.set(cacheKey, responseData, 120);

    res.json(responseData);

  } catch (err) {
    console.error('Error fetching category products:', err);
    res.status(500).json({ message: err.message });
  }
});

router.post('/', addProducts);
router.delete('/:sku', deleteProduct);
router.put('/:sku', updateProduct);
router.patch('/:sku', updateProduct);

// נתיב להמרת קטגוריות
router.post('/migrate-categories', migrateAllProducts);

// 🔐 פעולות אדמין
router.delete('/admin/delete-all', deleteAllProducts);

// 📥 העלאת מוצרים מקובץ Excel (bulk upsert)
router.post('/admin/upload-excel', upload.single("excelFile"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  try {
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = xlsx.utils.sheet_to_json(sheet);

    const productsToUpsert = rawData.map((row) => {
      const updateFields = {};
      if (row.productName) updateFields.productName = row.productName;
      if (row.category) updateFields.category = row.category;
      if (row.subcategory) updateFields.subcategory = row.subcategory;
      if (row.subsubcategory) updateFields.subsubcategory = row.subsubcategory;
      if (row.brand) updateFields.brand = row.brand;
      if (row.brandLogo) updateFields.brandLogo = row.brandLogo;
      if (row["Model Code"]) updateFields.model = row["Model Code"];
      if (row.titleDescription) updateFields.titleDescription = row.titleDescription;
      if (row.shortDescription) updateFields.shortDescription = row.shortDescription;
      if (row.longDescription) updateFields.longDescription = row.longDescription;
      if (row.price) updateFields.price = Number(row.price);
      if (row.priceInstead) updateFields.priceInstead = Number(row.priceInstead);
      if (row.country) updateFields.country = row.country;
      if (row.warranty) updateFields.warranty = row.warranty;
      if (row.image) updateFields.image = row.image;
      if (row.active !== undefined)
        updateFields.active = row.active === "TRUE" || row.active === true;
      updateFields.dateCreation = new Date();

      return {
        updateOne: {
          filter: { sku: row.sku },
          update: { $set: updateFields },
          upsert: true
        }
      };
    });

    await Product.bulkWrite(productsToUpsert);
    res.status(200).json({ message: "Excel upload (bulk upsert) successful", count: productsToUpsert.length });
  } catch (err) {
    res.status(500).json({ message: "Server error during Excel upload", error: err.message });
  }
});

// 🆔 עדכון שדה model בלבד
router.post('/admin/update-models', upload.single("excelFile"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);
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
});

// הוספת הנתיב החדש לעדכון שדה isSale
router.post('/admin/update-issale-field', async (req, res) => {
  try {
    const result = await Product.updateMany(
      { isSale: { $exists: false } },
      { $set: { isSale: false } }
    );

    res.status(200).json({ 
      message: "✅ השדה isSale עודכן בהצלחה", 
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error("❌ שגיאה בעדכון שדה isSale:", error);
    res.status(500).json({ message: error.message });
  }
});

// נתיב חדש לאתחול שדה isSale בכל המוצרים
router.post('/admin/init-sale-field', async (req, res) => {
  try {
    // מעדכן את כל המוצרים - מוסיף שדה isSale אם לא קיים
    const result = await Product.updateMany(
      { isSale: { $exists: false } },  // רק למוצרים שאין להם את השדה
      { $set: { isSale: false } }
    );

    res.json({
      message: "✅ שדה isSale אותחל בהצלחה",
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    });
  } catch (error) {
    console.error("שגיאה באתחול שדה isSale:", error);
    res.status(500).json({ message: error.message });
  }
});

// הוספת הנתיב החדש לעדכון המוצר במבצע
router.post('/test-sale', async (req, res) => {
  try {
    const testSku = 61906750;
    console.log("מנסה לעדכן מוצר למבצע:", testSku);  // לוג לדיבוג
    
    const result = await Product.findOneAndUpdate(
      { sku: testSku },
      { $set: { isSale: true } },
      { new: true }
    );

    if (!result) {
      console.log("מוצר לא נמצא");  // לוג לדיבוג
      return res.status(404).json({ message: "מוצר לא נמצא" });
    }

    console.log("מוצר עודכן בהצלחה:", result);  // לוג לדיבוג
    res.json({
      message: "✅ המוצר עודכן בהצלחה",
      product: result
    });

  } catch (error) {
    console.error("שגיאה בעדכון המוצר:", error);
    res.status(500).json({ message: error.message });
  }
});

// הוספת הנתיב החדש להוספת שדה isSale לכל המוצרים
router.post('/init-sale-field', async (req, res) => {
  try {
    // מעדכן את כל המוצרים שאין להם שדה isSale
    const result = await Product.updateMany(
      { isSale: { $exists: false } },  // מוצא את כל המוצרים ללא שדה isSale
      { $set: { isSale: false } }      // מגדיר להם ברירת מחדל false
    );

    res.json({
      message: "✅ השדה isSale הוגדר בהצלחה לכל המוצרים",
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error("שגיאה בהוספת שדה isSale:", error);
    res.status(500).json({ message: error.message });
  }
});

// נתיב לעדכון סטטוס מבצע למוצר לפי מק"ט
router.post('/update-sale-status', async (req, res) => {
  try {
    const { sku, isSale } = req.body;
    
    const result = await Product.findOneAndUpdate(
      { sku: sku },
      { $set: { isSale: isSale } },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: "מוצר לא נמצא" });
    }

    res.json({
      message: `✅ סטטוס המבצע של המוצר ${sku} עודכן ל-${isSale}`,
      product: result
    });

  } catch (error) {
    console.error("שגיאה בעדכון סטטוס מבצע:", error);
    res.status(500).json({ message: error.message });
  }
});

// 🏷️ Update homeSaleProducts field for specific products
router.post('/admin/update-homesale', async (req, res) => {
  try {
    const { skus, value = true } = req.body;

    if (!skus || !Array.isArray(skus)) {
      return res.status(400).json({
        message: "❌ נא לספק מערך של מק\"טים"
      });
    }

    const result = await Product.updateMany(
      { sku: { $in: skus } },
      { $set: { homeSaleProducts: value } }
    );

    return res.status(200).json({
      message: `✅ עודכנו ${result.modifiedCount} מוצרים בהצלחה`,
      updatedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    });

  } catch (error) {
    console.error("❌ שגיאה בעדכון מוצרי מבצע:", error);
    res.status(500).json({ 
      message: "שגיאה בעדכון מוצרי מבצע", 
      error: error.message 
    });
  }
});

// 🏷️ אתחול שדה homeSaleProducts לכל המוצרים
router.post('/admin/init-homesale-field', async (req, res) => {
  try {
    // מעדכן את כל המוצרים שאין להם שדה homeSaleProducts
    const result = await Product.updateMany(
      { homeSaleProducts: { $exists: false } },  // מוצא את כל המוצרים ללא שדה homeSaleProducts
      { $set: { homeSaleProducts: false } }      // מגדיר להם ברירת מחדל false
    );

    res.json({
      message: "✅ השדה homeSaleProducts הוגדר בהצלחה לכל המוצרים",
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    });

  } catch (error) {
    console.error("❌ שגיאה בהוספת שדה homeSaleProducts:", error);
    res.status(500).json({ message: error.message });
  }
});

// עדכון categoryId למוצר
router.patch('/sku/:sku/category', async (req, res) => {
  try {
    const { sku } = req.params;
    const { categoryId } = req.body;
    
    if (!categoryId) {
      return res.status(400).json({ message: 'categoryId is required' });
    }

    const product = await Product.findOneAndUpdate(
      { sku },
      { $set: { categoryId: Number(categoryId) } },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    console.error('Error updating product category:', err);
    res.status(500).json({ message: err.message });
  }
});

// עדכון מיקום מוצר
router.patch('/:id', async (req, res) => {
  try {
    const { position } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { position },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'מוצר לא נמצא' });
    }
    
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'שגיאה בעדכון מיקום המוצר', error: err.message });
  }
});

// עדכון מיקום מוצר
router.patch('/:sku/position', async (req, res) => {
  try {
    const { sku } = req.params;
    const { position, categoryId } = req.body;
    
    // מצא את המוצר שרוצים לעדכן
    const productToUpdate = await Product.findOne({ sku });
    if (!productToUpdate) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const oldPosition = productToUpdate.position;
    const newPosition = parseInt(position);

    // אם המיקום החדש הוא null
    if (newPosition === null) {
      productToUpdate.position = null;
      await productToUpdate.save();
      
      // החזר רק את המוצרים מאותה קטגוריה
      const productsInCategory = await Product.find({ categoryId }).sort({ position: 1 });
      return res.json({ products: productsInCategory });
    }

    // עדכן את המיקומים של שאר המוצרים באותה קטגוריה
    await Product.updateMany(
      { 
        categoryId,
        position: { $gte: newPosition },
        sku: { $ne: sku }
      },
      { $inc: { position: 1 } }
    );

    // עדכן את המיקום של המוצר הנוכחי
    productToUpdate.position = newPosition;
    await productToUpdate.save();

    // החזר רק את המוצרים המעודכנים מאותה קטגוריה
    const updatedProducts = await Product.find({ categoryId })
      .sort({ position: 1 })
      .lean();

    res.json({
      message: 'Position updated successfully',
      products: updatedProducts
    });

  } catch (error) {
    console.error('Error updating position:', error);
    res.status(500).json({ message: error.message });
  }
});

// נתיב בדיקה
router.post('/test-migrate', (req, res) => {
  res.json({ message: 'Test route works!' });
});

// 🔄 עדכון categoryId למוצרים לפי הקטגוריות הישנות
router.post('/update-category-ids', async (req, res) => {
  try {
    // מצא את כל המוצרים שאין להם categoryId
    const products = await Product.find({
      categoryId: null,
      category: { $exists: true },
      subcategory: { $exists: true }
    });

    console.log(`נמצאו ${products.length} מוצרים ללא categoryId`);

    // מצא את כל הקטגוריות
    const categories = await Category.find({});
    const categoryMap = new Map();

    // יצירת מפה של קטגוריות לפי שם
    categories.forEach(cat => {
      categoryMap.set(cat.categoryName.trim().toLowerCase(), cat.categoryId);
    });

    let updatedCount = 0;
    const errors = [];

    // עדכון כל מוצר
    for (const product of products) {
      try {
        const categoryName = product.category.trim().toLowerCase();
        const categoryId = categoryMap.get(categoryName);

        if (categoryId) {
          await Product.updateOne(
            { _id: product._id },
            { $set: { categoryId: categoryId } }
          );
          updatedCount++;
          console.log(`עודכן מוצר ${product.sku} לקטגוריה ${categoryId}`);
        } else {
          errors.push({
            sku: product.sku,
            category: product.category,
            error: 'קטגוריה לא נמצאה'
          });
        }
      } catch (err) {
        errors.push({
          sku: product.sku,
          category: product.category,
          error: err.message
        });
      }
    }

    res.json({
      message: `עודכנו ${updatedCount} מוצרים`,
      totalProducts: products.length,
      updatedCount,
      errors
    });

  } catch (err) {
    console.error('שגיאה בעדכון קטגוריות:', err);
    res.status(500).json({ message: err.message });
  }
});

// 🔄 Bulk update product categories - Simple version
router.put('/bulk-update-categories', async (req, res) => {
  try {
    const updates = req.body;
    
    console.log('Request body:', typeof updates, JSON.stringify(updates, null, 2));
    
    if (!Array.isArray(updates)) {
      console.log('Error: updates is not an array');
      return res.status(400).json({ message: 'Request body must be an array' });
    }

    console.log(`Processing ${updates.length} updates...`);

    const bulkOps = updates.map((update, index) => {
      console.log(`Creating operation ${index + 1}:`, update);
      return {
        updateOne: {
          filter: { sku: update.sku },
          update: { $set: { categoryId: update.categoryId } }
        }
      };
    });

    console.log('Bulk operations prepared:', JSON.stringify(bulkOps, null, 2));
    console.log('Starting bulkWrite operation...');

    const result = await Product.bulkWrite(bulkOps);
    
    console.log('Bulk update completed:', result);

    res.json({
      message: 'Categories updated successfully',
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error('Error in bulk update:', err);
    console.error('Error details:', {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ 
      error: 'Failed to update categories',
      details: err.message
    });
  }
});

// Update a single product field
router.patch('/:sku', async (req, res) => {
  try {
    const sku = req.params.sku;
    const updateData = req.body;

    // Validate the update data
    const validFields = [
      'productName',
      'position',
      'price',
      'priceInstead',
      'active',
      'isSale',
      'homeSaleProducts',
      'categoryId'
    ];

    const invalidFields = Object.keys(updateData).filter(
      field => !validFields.includes(field)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        message: `Invalid fields: ${invalidFields.join(', ')}`
      });
    }

    // Handle position update with reordering
    if ('position' in updateData) {
      const productToUpdate = await Product.findOne({ sku });
      if (!productToUpdate) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const oldPosition = productToUpdate.position || 0;
      const newPosition = parseInt(updateData.position);
      const categoryId = productToUpdate.categoryId;

      if (newPosition < oldPosition) {
        // אם המיקום החדש קטן יותר, הזז את כל המוצרים שביניהם מעלה
        await Product.updateMany(
          { 
            categoryId,
            position: { $gte: newPosition, $lt: oldPosition },
            sku: { $ne: sku }
          },
          { $inc: { position: 1 } }
        );
      } else if (newPosition > oldPosition) {
        // אם המיקום החדש גדול יותר, הזז את כל המוצרים שביניהם למטה
        await Product.updateMany(
          { 
            categoryId,
            position: { $gt: oldPosition, $lte: newPosition },
            sku: { $ne: sku }
          },
          { $inc: { position: -1 } }
        );
      }
    }

    // Convert numeric fields
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.priceInstead) updateData.priceInstead = parseFloat(updateData.priceInstead);
    if (updateData.position) updateData.position = parseInt(updateData.position);
    if (updateData.categoryId) updateData.categoryId = parseInt(updateData.categoryId);

    const product = await Product.findOneAndUpdate(
      { sku },
      { $set: updateData },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // If position was updated, return all products in the same category
    if ('position' in updateData) {
      const updatedProducts = await Product.find({ categoryId: product.categoryId })
        .sort({ position: 1 })
        .lean();
      
      res.json({
        message: 'Position updated successfully',
        products: updatedProducts
      });
    } else {
      res.json(product);
    }
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
