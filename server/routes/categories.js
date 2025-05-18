const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const Category = require('../models/Category');
const { getCategoryTree } = require('../controllers/categoryController');

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.includes('excel') ||
      file.mimetype.includes('spreadsheetml') ||
      file.mimetype === 'text/csv' ||
      file.originalname.endsWith('.csv')
    ) {
      cb(null, true);
    } else {
      cb(new Error('רק קבצי אקסל או CSV מותרים'));
    }
  }
});

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Categories router is working' });
});

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({})
      .select('categoryId categoryName categoryLevel parentId position slug description isActive')
      .sort({ categoryName: 1 })
      .lean();

    console.log('Loaded categories from DB:', categories.length);
    res.json(categories);
  } catch (error) {
    console.error('Error loading categories:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get category tree
router.get('/tree', async (req, res) => {
  try {
    const allCategories = await Category.find({ isActive: true })
      .sort('position')
      .lean()
      .select('categoryId categoryName parentId position children slug isActive');
    
    if (!allCategories || allCategories.length === 0) {
      return res.json([]);
    }

    const categoryMap = {};
    const rootCategories = [];

    // בניית המפה וזיהוי קטגוריות שורש בלולאה אחת
    allCategories.forEach(category => {
      // וידוא שיש slug תקין
      if (!category.slug) {
        category.slug = category.categoryName.replace(/\s+/g, '-');
      }
      
      categoryMap[category.categoryId] = { ...category, children: [] };
      if (!category.parentId) {
        rootCategories.push(categoryMap[category.categoryId]);
      }
    });

    // הוספת ילדים בלולאה אחת
    allCategories.forEach(category => {
      if (category.parentId && categoryMap[category.parentId]) {
        categoryMap[category.parentId].children.push(categoryMap[category.categoryId]);
      }
    });

    // מיון סופי
    rootCategories.sort((a, b) => (a.position || 0) - (b.position || 0));
    rootCategories.forEach(root => {
      if (root.children) {
        root.children.sort((a, b) => (a.position || 0) - (b.position || 0));
      }
    });

    res.json(rootCategories);
  } catch (error) {
    console.error('Error in category tree:', error);
    res.status(500).json({ message: error.message });
  }
});

// הבאת קטגוריה ספציפית לפי ID
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findOne({ categoryId: req.params.id });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// הוספת קטגוריה חדשה
router.post('/', async (req, res) => {
  const category = new Category(req.body);
  try {
    const newCategory = await category.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// הוספת מספר קטגוריות בבת אחת
router.post('/bulk', async (req, res) => {
  console.log('Received bulk insert request');
  console.log('Request body:', req.body);
  try {
    const categories = await Category.insertMany(req.body);
    res.status(201).json(categories);
  } catch (error) {
    console.error('Error in bulk insert:', error);
    res.status(400).json({ message: error.message });
  }
});

// עדכון קטגוריה
router.put('/:id', async (req, res) => {
  try {
    const category = await Category.findOneAndUpdate(
      { categoryId: req.params.id },
      req.body,
      { new: true }
    );
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// מחיקת קטגוריה
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({ categoryId: req.params.id });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'לא נבחר קובץ' });
    }

    const workbook = xlsx.read(req.file.buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    // אם הקובץ מכיל רק categoryId ו-description - עדכון תיאורים בלבד
    if (
      data.length > 0 &&
      Object.keys(data[0]).length === 2 &&
      data[0].categoryId && data[0].description
    ) {
      let updated = 0;
      for (const row of data) {
        const result = await Category.findOneAndUpdate(
          { categoryId: parseInt(row.categoryId) },
          { description: row.description },
          { new: true }
        );
        if (result) updated++;
      }
      return res.json({ message: 'תיאורים עודכנו', updated });
    }

    const categories = data.map((row, index) => {
      try {
        // המרה בטוחה למספרים
        const categoryId = parseInt(row.categoryId);
        const categoryLevel = parseInt(row.categoryLevel);
        const position = parseInt(row.position);
        const parentId = row.parentId ? parseInt(row.parentId) : null;

        if (isNaN(categoryId)) throw new Error(`Invalid categoryId in row ${index + 1}`);
        if (isNaN(categoryLevel)) throw new Error(`Invalid categoryLevel in row ${index + 1}`);
        if (isNaN(position)) throw new Error(`Invalid position in row ${index + 1}`);
        if (!row.categoryName) throw new Error(`Missing categoryName in row ${index + 1}`);

        return {
          categoryId,
          categoryName: row.categoryName.trim(),
          categoryLevel,
          parentId: isNaN(parentId) ? null : parentId,
          position,
          isActive: String(row.isActive).toUpperCase() === 'TRUE',
          slug: row.slug || row.categoryName.replace(/\s+/g, '-'),
          description: row.description || ''
        };
      } catch (err) {
        console.error(`Error processing row ${index + 1}:`, err.message);
        throw err;
      }
    });

    await Category.deleteMany({});
    await Category.insertMany(categories);

    res.json({ message: 'הקטגוריות הועלו בהצלחה', count: categories.length });
  } catch (error) {
    console.error('Upload error:', {
      message: error.message,
      stack: error.stack,
      data: error.data
    });
    res.status(500).json({ 
      message: 'שגיאה בהעלאת הקטגוריות',
      error: error.message,
      details: error.data
    });
  }
});

// Get category by slug - MUST COME BEFORE DYNAMIC ROUTES
router.get('/slug/:slug', async (req, res) => {
  try {
    if (!req.params.slug || req.params.slug === 'undefined') {
      return res.status(400).json({ message: 'Invalid slug' });
    }

    const category = await Category.findOne({ 
      slug: req.params.slug,
      isActive: true 
    })
    .select('categoryId categoryName categoryLevel parentId position slug description isActive')
    .lean();
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Dynamic route for specific category - MUST COME AFTER /tree and /slug
router.get('/:categoryId', async (req, res) => {
  try {
    const category = await Category.findOne({ 
      categoryId: Number(req.params.categoryId) 
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// קבלת נתיב הקטגוריה
router.get('/:id/path', async (req, res) => {
  try {
    const categoryId = Number(req.params.id);
    const path = [];
    let currentCategory = await Category.findOne({ categoryId });

    while (currentCategory) {
      path.unshift(currentCategory);
      if (!currentCategory.parentId) break;
      currentCategory = await Category.findOne({ categoryId: currentCategory.parentId });
    }

    res.json(path);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 