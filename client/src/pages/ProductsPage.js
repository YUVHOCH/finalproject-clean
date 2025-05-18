import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import SearchStrip from "../components/SearchStrip";
import { useCategories } from "../context/CategoryContext";
import { useSearch } from "../context/SearchContext";
import styles from "../styles/ProductsPage.module.css";
import commonStyles from "../styles/common.module.css";
import FilterSidebar from "../components/FilterSidebar";

const ProductsPage = () => {
  const { categorySlug } = useParams();
  const { getCategoryPath, getCategoryBySlug } = useCategories();
  const { searchTerm } = useSearch();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryPath, setCategoryPath] = useState([]);
  const [categoryDescription, setCategoryDescription] = useState("");
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
  const [dynamicFilters, setDynamicFilters] = useState({}); // { fieldName: [selectedValues] }

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (!categorySlug) {
          // אם אין קטגוריה, טען את כל המוצרים
          setLoading(true);
          const response = await axios.get('http://localhost:8000/products');
          let allProducts = response.data.products || [];
          
          // אם יש חיפוש, סנן את התוצאות
          if (searchTerm) {
            const term = searchTerm.toLowerCase();
            allProducts = allProducts.filter(product => 
              (product.productName && product.productName.toLowerCase().includes(term)) ||
              (product.shortDescription && product.shortDescription.toLowerCase().includes(term)) ||
              (product.sku && product.sku.toString().toLowerCase() === term)
            );
          }
          
          setProducts(allProducts);
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);
        
        // קבל את הקטגוריה לפי ה-slug
        const category = await getCategoryBySlug(categorySlug);
        
        if (!category) {
          setError('קטגוריה לא נמצאה');
          setLoading(false);
          return;
        }

        // הוסף:
        setCategoryDescription(category.description || "");

        // טען את המוצרים של הקטגוריה
        const response = await axios.get(`http://localhost:8000/products/by-category/${category.categoryId}`);
        
        if (response.data.products) {
          const validProducts = response.data.products.filter(product => product.categoryId === category.categoryId);
          setProducts(validProducts);
        } else {
          setProducts([]);
        }
        
        // עדכן את נתיב הקטגוריות
        const path = await getCategoryPath(category.categoryId);
        setCategoryPath(path);

      } catch (err) {
        setError(err.message);
        setProducts([]); // במקרה של שגיאה - מערך ריק
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categorySlug, searchTerm]);

  // יצירת שרשרת הניווט (Breadcrumbs)
  const renderBreadcrumbs = () => {
    if (!categoryPath.length) return null;

    return (
      <div className={styles.caterorylist}>
        {categoryPath.map((category, index) => (
          <React.Fragment key={category.categoryId}>
            {index > 0 && " / "}
            <span>{category.categoryName}</span>
          </React.Fragment>
        ))}
      </div>
    );
  };

  // חישוב ערכי פילטרים דינמיים (מותגים, מחירים, שדות עתידיים)
  const brandsInCategory = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));
  const priceRanges = [
    { label: "עד 100 ש\"ח", value: "0-100" },
    { label: "100-250 ש\"ח", value: "100-250" },
    { label: "250-400 ש\"ח", value: "250-400" },
    { label: "400-700 ש\"ח", value: "400-700" },
    { label: "700-1000 ש\"ח", value: "700-1000" },
    { label: "מעל 1000 ש\"ח", value: "1000+" }
  ];
  // דוגמה לפילטר דינמי עתידי:
  const mowerTypes = Array.from(new Set(products.map(p => p.mowerType).filter(Boolean)));

  // לוגיקת סינון
  const filteredProducts = products.filter(product => {
    // סינון מותגים
    if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) return false;
    // סינון טווחי מחירים
    if (selectedPriceRanges.length > 0) {
      const inRange = selectedPriceRanges.some(range => {
        if (range === "0-100") return product.price <= 100;
        if (range === "100-250") return product.price > 100 && product.price <= 250;
        if (range === "250-400") return product.price > 250 && product.price <= 400;
        if (range === "400-700") return product.price > 400 && product.price <= 700;
        if (range === "700-1000") return product.price > 700 && product.price <= 1000;
        if (range === "1000+") return product.price > 1000;
        return false;
      });
      if (!inRange) return false;
    }
    // סינון דינמי (לדוג' mowerType)
    if (dynamicFilters.mowerType && dynamicFilters.mowerType.length > 0) {
      if (!dynamicFilters.mowerType.includes(product.mowerType)) return false;
    }
    return true;
  });

  if (error) {
    return <div className={styles.error}>שגיאה: {error}</div>;
  }

  return (
    <main className={styles.pageWrapper}>
      <SearchStrip />
      <div className={styles.contentWrapper}>
        <FilterSidebar
          brands={brandsInCategory}
          selectedBrands={selectedBrands}
          setSelectedBrands={setSelectedBrands}
          priceRanges={priceRanges}
          selectedPriceRanges={selectedPriceRanges}
          setSelectedPriceRanges={setSelectedPriceRanges}
          dynamicFilters={dynamicFilters}
          setDynamicFilters={setDynamicFilters}
          mowerTypes={mowerTypes} // דוגמה לפילטר עתידי
        />
        <div className={styles.mainContent}>
          {renderBreadcrumbs()}
          <h1 className={styles.categoryTitle}>
            {categorySlug && categoryPath.length > 0
              ? categoryPath[categoryPath.length - 1].categoryName
              : searchTerm
                ? `תוצאות חיפוש: ${searchTerm}`
                : 'כל המוצרים'}
          </h1>
          {categoryDescription && !searchTerm && (
            <div className={styles.categoryDescription}>{categoryDescription}</div>
          )}
          {loading ? (
            <div className={commonStyles.loadingContainer}>
              <div className={commonStyles.spinner}></div>
            </div>
          ) : (
            <div className={styles.productsGrid}>
              {filteredProducts
                .sort((a, b) => {
                  // Handle null/undefined values in position
                  if (a.position === null || a.position === undefined) return 1;
                  if (b.position === null || b.position === undefined) return -1;
                  return a.position - b.position;
                })
                .map(product => (
                  <ProductCard 
                    key={product.sku} 
                    {...product}
                    className="category-product-card"
                  />
                ))}
              {filteredProducts.length === 0 && !loading && (
                <div className={styles.noProducts}>
                  לא נמצאו מוצרים בקטגוריה זו
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default ProductsPage;
