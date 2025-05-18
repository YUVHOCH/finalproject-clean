const Category = require('../models/Category');

// בניית עץ קטגוריות מהמערך השטוח
const buildCategoryTree = (categories) => {
  const categoryMap = {};
  const roots = [];

  // ראשית, נמפה את כל הקטגוריות לפי ה-ID שלהן
  categories.forEach(category => {
    // המרה בטוחה לאובייקט רגיל
    const categoryObj = category.toObject ? category.toObject() : category;
    
    categoryMap[categoryObj.categoryId] = {
      ...categoryObj,
      children: []
    };
  });

  // עכשיו נבנה את העץ
  categories.forEach(category => {
    const categoryObj = category.toObject ? category.toObject() : category;
    const node = categoryMap[categoryObj.categoryId];
    
    if (categoryObj.parentId === null) {
      // אם אין הורה, זה שורש
      roots.push(node);
    } else {
      // אחרת, נוסיף לילדים של ההורה
      const parent = categoryMap[categoryObj.parentId];
      if (parent) {
        parent.children.push(node);
      }
    }
  });

  // מיון הקטגוריות לפי position
  const sortByPosition = (a, b) => a.position - b.position;
  roots.sort(sortByPosition);
  
  // מיון ילדים של כל קטגוריה לפי position
  const sortChildren = (node) => {
    if (node.children && node.children.length > 0) {
      node.children.sort(sortByPosition);
      node.children.forEach(sortChildren);
    }
  };
  roots.forEach(sortChildren);

  return roots;
};

// שליפת כל הקטגוריות כעץ מסודר
const getCategoryTree = async (req, res) => {
  try {
    const categories = await Category.find({}).sort('position').lean();
    const categoryTree = buildCategoryTree(categories);
    res.json(categoryTree);
  } catch (error) {
    console.error('Error in getCategoryTree:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCategoryTree,
  buildCategoryTree
}; 