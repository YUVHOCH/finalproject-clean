// ✅ src/components/CategoryMenu.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCategories } from "../context/CategoryContext";
import styles from "../styles/CategoryMenu.module.css";

const CategoryMenu = ({ closeMenu }) => {
  const navigate = useNavigate();
  const { categoryTree, getCategoryTree, loading } = useCategories();
  const [hoveredCategory, setHoveredCategory] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      if (!categoryTree || categoryTree.length === 0) {
        await getCategoryTree();
      }
    };
    loadCategories();
  }, [categoryTree, getCategoryTree]);

  // אפקט חדש שיקבע את הקטגוריה הראשונה כברירת מחדל
  useEffect(() => {
    if (categoryTree && categoryTree.length > 0 && !hoveredCategory) {
      setHoveredCategory(categoryTree[0].categoryId);
    }
  }, [categoryTree]);

  const handleCategoryClick = (category) => {
    if (!category || !category.slug) {
      console.error('ניסיון ניווט לקטגוריה לא תקינה:', category);
      return;
    }

    navigate(`/category/${category.slug}`);
    if (closeMenu) closeMenu();
  };

  if (loading) {
    return <div className={styles.loading}>טוען קטגוריות...</div>;
  }

  if (!categoryTree || categoryTree.length === 0) {
    return <div className={styles.error}>לא נמצאו קטגוריות</div>;
  }

  const getHoveredCategoryData = () => {
    return categoryTree.find(cat => cat.categoryId === hoveredCategory);
  };

  return (
    <div className={styles.menuContainer}>
      {/* קטגוריות ראשיות */}
      <div className={styles.mainCategories}>
        {categoryTree.map(category => (
          <div
            key={category.categoryId}
            className={`${styles.mainCategory} ${
              hoveredCategory === category.categoryId ? styles.active : ''
            }`}
          >
            <span
              className={styles.mainCategoryName}
              onClick={() => handleCategoryClick(category)}
              onMouseEnter={() => setHoveredCategory(category.categoryId)}
            >
              {category.categoryName}
            </span>
          </div>
        ))}
      </div>

      {/* תת קטגוריות */}
      {hoveredCategory && (
        <div className={styles.subCategoriesWrapper}>
          <div className={styles.subCategoriesContainer}>
            {getHoveredCategoryData()?.children?.map(subCategory => (
              <div key={subCategory.categoryId} className={styles.subCategoryGroup}>
                <div 
                  className={styles.subCategoryTitle}
                  onClick={() => handleCategoryClick(subCategory)}
                >
                  {subCategory.categoryName}
                </div>
                {subCategory.children && subCategory.children.length > 0 && (
                  <div className={styles.subsubCategories}>
                    {subCategory.children.map(subsubCategory => (
                      <div
                        key={subsubCategory.categoryId}
                        className={styles.subsubCategory}
                        onClick={() => handleCategoryClick(subsubCategory)}
                      >
                        {subsubCategory.categoryName}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryMenu;
