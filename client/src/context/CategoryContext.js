import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

export const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // טעינה ראשונית של הקטגוריות
  const loadCategories = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/categories`);
      console.log('Loaded categories:', response.data.length);
      setCategories(response.data);
      return response.data;
    } catch (err) {
      console.error('Error loading categories:', err);
      setError(err.message);
      return [];
    }
  };

  // קבלת עץ הקטגוריות
  const getCategoryTree = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${config.API_URL}/api/categories/tree`);
      
      if (Array.isArray(response.data)) {
        // וידוא שלכל קטגוריה יש slug
        const processedCategories = response.data.map(category => {
          if (!category.slug && category.categoryName) {
            category.slug = category.categoryName.replace(/\s+/g, '-');
          }
          return category;
        });
        
        setCategoryTree(processedCategories);
        return processedCategories;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching category tree:', err);
      setError(err.message);
      setCategoryTree([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // פונקציה לאיפוס המטמון של עץ הקטגוריות
  const resetCategoryTree = () => {
    console.log('Resetting category tree cache');
    setCategoryTree([]);
  };

  // טעינה ראשונית של הקטגוריות
  useEffect(() => {
    const initializeCategories = async () => {
      await loadCategories();
      await getCategoryTree();
    };
    
    initializeCategories();
  }, []);

  // קבלת כל הקטגוריות כרשימה שטוחה
  const getCategories = async () => {
    return loadCategories();
  };

  // העלאת קטגוריות מקובץ אקסל
  const uploadCategories = async (file) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${config.API_URL}/api/categories/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      await getCategoryTree(); // עדכון עץ הקטגוריות לאחר העלאה
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading categories');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // מציאת קטגוריה לפי ID
  const findCategoryById = async (categoryId) => {
    let category = categories.find(cat => cat.categoryId === categoryId);
    
    // אם לא נמצאה קטגוריה, נסה לטעון מחדש
    if (!category) {
      console.log(`Category ${categoryId} not found in cache, reloading...`);
      const freshCategories = await loadCategories();
      category = freshCategories.find(cat => cat.categoryId === categoryId);
    }

    console.log(`Finding category ${categoryId}:`, category);
    return category;
  };

  // קבלת נתיב מלא לקטגוריה (כולל הורים)
  const getCategoryPath = async (categoryId) => {
    console.log('Getting path for category:', categoryId);
    const path = [];
    let currentCategory = await findCategoryById(categoryId);
    
    while (currentCategory) {
      console.log('Current category in path:', currentCategory);
      path.unshift(currentCategory);
      currentCategory = currentCategory.parentId ? await findCategoryById(currentCategory.parentId) : null;
    }
    
    console.log('Final category path:', path);
    return path;
  };

  // קבלת קטגוריה לפי slug
  const getCategoryBySlug = async (slug) => {
    try {
      console.log('Fetching category by slug:', slug);
      const response = await axios.get(`${config.API_URL}/api/categories/slug/${slug}`);
      console.log('Category by slug response:', response.data);
      
      // עדכן את המטמון המקומי
      if (response.data) {
        setCategories(prev => {
          const exists = prev.some(cat => cat.categoryId === response.data.categoryId);
          if (!exists) {
            return [...prev, response.data];
          }
          return prev;
        });
      }
      
      return response.data;
    } catch (err) {
      console.error('Error fetching category by slug:', err);
      return null;
    }
  };

  return (
    <CategoryContext.Provider
      value={{
        categories,
        categoryTree,
        loading,
        error,
        uploadCategories,
        getCategories,
        getCategoryTree,
        resetCategoryTree,
        findCategoryById,
        getCategoryPath,
        getCategoryBySlug
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => useContext(CategoryContext); 