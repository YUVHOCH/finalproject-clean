import React, { useEffect, useState } from "react";
import styles from "../styles/AdminProducts.module.css";
import { useNavigate } from "react-router-dom";
import UploadExcelButton from "../components/UploadExcelButton";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [displayLimit, setDisplayLimit] = useState('50');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // טעינת מוצרים
      const productsRes = await fetch("http://localhost:8000/products");
      const productsData = await productsRes.json();
      const products = productsData.products || [];
      console.log("📦 Loaded products:", products.length);
      setProducts(products);

      // טעינת קטגוריות בנפרד
      const categoriesRes = await fetch("http://localhost:8000/api/categories");
      if (!categoriesRes.ok) {
        throw new Error(`Failed to fetch categories: ${categoriesRes.status}`);
      }
      const categoriesData = await categoriesRes.json();
      console.log("📂 Loaded categories:", categoriesData);
      
      // מיון הקטגוריות לפי שם
      const sortedCategories = [...categoriesData].sort((a, b) => 
        (a.categoryName || '').localeCompare(b.categoryName || '', 'he')
      );
      
      setCategories(sortedCategories);
    } catch (err) {
      console.error("❌ Error loading data:", err);
      setProducts([]);
      setCategories([]);
    }
  };

  const handleDeleteAll = async () => {
    const firstConfirm = window.confirm("⚠️ Are you sure you want to delete ALL products?");
    if (!firstConfirm) return;
  
    const secondConfirm = window.confirm("❗ This action is irreversible. Are you REALLY sure?");
    if (!secondConfirm) return;
  
    try {
      const res = await fetch("http://localhost:8000/products/admin/delete-all", {
        method: "DELETE",
      });
      const data = await res.json();
      alert("🗑️ " + data.message);
      fetchProducts();
    } catch (err) {
      console.error("❌ Failed to delete:", err);
      alert("❌ Failed to delete products");
    }
  };

  const handleUploadFromJson = async () => {
    try {
      const res = await fetch("http://localhost:8000/products/admin/upload-json", {
        method: "POST",
      });
      const data = await res.json();
      alert(`✅ ${data.message} (${data.count || 0} products uploaded)`);
      fetchProducts();
    } catch (err) {
      console.error("❌ Failed to upload:", err);
      alert("❌ Failed to upload products");
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const res = await fetch("http://localhost:8000/products");
      const data = await res.json();
      const products = data.products || [];

      // הגדרת סדר השדות בדיוק כמו בסכימה
      const fieldOrder = [
        'sku',
        'productName',
        'titleDescription',
        'shortDescription',
        'price',
        'priceInstead',
        'category',
        'brand',
        'dateCreation',
        '__v',
        'model',
        'brandLogo',
        'active',
        'image',
        'longDescription',
        'country',
        'warranty',
        'subcategory',
        'subsubcategory',
        'isSale',
        'homeSaleProducts',
        'categoryId',
        'position'
      ];

      // המרת המוצרים לפורמט המבוקש
      const cleanProducts = products.map(product => {
        const cleanProduct = {};
        fieldOrder.forEach(field => {
          let value = product[field];
          
          // טיפול מיוחד בשדות HTML
          if (field === 'shortDescription' || field === 'longDescription') {
            value = value?.replace(/<[^>]+>/g, ' ')  // הסרת תגיות HTML
                         .replace(/&nbsp;/g, ' ')    // המרת רווחים מיוחדים
                         .replace(/\s+/g, ' ')       // הסרת רווחים מיותרים
                         .trim() || '';
          }
          
          // טיפול בתאריכים
          if (field === 'dateCreation' && value) {
            value = new Date(value).toISOString();
          }
          
          // טיפול במספרים
          if (['price', 'priceInstead'].includes(field)) {
            value = value ? Number(value).toFixed(2) : '0.00';
          }
          
          // טיפול בבוליאנים
          if (['active', 'isSale', 'homeSaleProducts'].includes(field)) {
            value = value ? 'true' : 'false';
          }
          
          cleanProduct[field] = value ?? '';
        });
        return cleanProduct;
      });

      // יצירת תוכן ה-CSV
      const headers = fieldOrder.join(',');
      const rows = cleanProducts.map(product => 
        fieldOrder.map(field => {
          const value = product[field];
          // עטיפת ערכים במרכאות כפולות ובריחה מתווים מיוחדים
          return typeof value === 'string' 
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        }).join(',')
      );

      const csv = [headers, ...rows].join('\n');

      // הורדת הקובץ
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }); // הוספת BOM לתמיכה בעברית
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `products_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("❌ Failed to download products:", err);
      alert("❌ Could not download products");
    }
  };

  const handleEdit = (sku) => {
    navigate(`/admin/products/edit/${sku}`);
  };

  const handleDelete = async (sku) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete product ${sku}?`);
    if (!confirmDelete) return;
  
    try {
      const res = await fetch(`http://localhost:8000/products/${sku}`, {
        method: "DELETE",
      });
      const data = await res.json();
      alert("🗑️ " + data.message);
      fetchProducts();
    } catch (err) {
      console.error("❌ Failed to delete product:", err);
      alert("❌ Could not delete product");
    }
  };

  const handleFieldChange = async (sku, field, value) => {
    try {
      // מטפל במקרה מיוחד של עדכון מיקום
      if (field === 'position') {
        const newPosition = value ? parseInt(value) : null;
        
        // מצא את המוצר הנוכחי
        const currentProduct = products.find(p => p.sku === sku);
        const categoryId = currentProduct?.categoryId;

        // עדכן את המיקום
        const res = await fetch(`http://localhost:8000/products/${sku}/position`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            position: newPosition,
            categoryId: categoryId 
          }),
        });

        if (!res.ok) throw new Error("Failed to update position");
        
        const { products: updatedProducts } = await res.json();
        
        // עדכן רק את המוצרים מאותה קטגוריה
        setProducts(prevProducts => {
          const productsInOtherCategories = prevProducts.filter(p => p.categoryId !== categoryId);
          const updatedProductsInCategory = updatedProducts.filter(p => p.categoryId === categoryId);
          return [...productsInOtherCategories, ...updatedProductsInCategory]
            .sort((a, b) => {
              if (a.categoryId === b.categoryId) {
                // אם באותה קטגוריה, מיין לפי position
                if (a.position === null) return 1;
                if (b.position === null) return -1;
                return a.position - b.position;
              }
              // אחרת, שמור על הסדר הקיים של הקטגוריות
              return 0;
            });
        });
      } else {
        // טיפול בשאר השדות
        const res = await fetch(`http://localhost:8000/products/${sku}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ [field]: value }),
        });
        
        if (!res.ok) throw new Error("Failed to update field");
        
        const data = await res.json();
        setProducts(prevProducts => 
          prevProducts.map(p => p.sku === sku ? { ...p, [field]: value } : p)
        );
      }
    } catch (err) {
      console.error("❌ Failed to update field:", err);
      alert("❌ Could not update field");
    }
  };

  // הוספת פונקציה לטיפול בשינוי קטגוריה
  const handleCategoryChange = (e) => {
    const newCategoryId = e.target.value;
    console.log("🔄 Selected category:", newCategoryId);
    setSelectedCategory(newCategoryId);
    
    // אם משנים קטגוריה, נאפס את חיפוש הקטגוריות
    if (categorySearchTerm) {
      setCategorySearchTerm("");
    }
  };

  // Filter categories based on search term
  const filteredCategories = categories
    .filter(cat => {
      // סינון רק קטגוריות ברמה 3
      if (cat.categoryLevel !== 3) return false;
      
      // סינון לפי חיפוש
      if (!categorySearchTerm) return true;
      const searchLower = categorySearchTerm.toLowerCase();
      return (
        (cat.categoryName || '').toLowerCase().includes(searchLower) ||
        (cat.categoryId?.toString() || '').includes(searchLower)
      );
    })
    // מיון לפי מספר קטגוריה
    .sort((a, b) => (a.categoryId || 0) - (b.categoryId || 0));

  // בדיקה שהקטגוריות אכן נטענו
  useEffect(() => {
    console.log("📂 Categories state:", categories);
    console.log("📂 Filtered categories (level 3):", filteredCategories);
  }, [categories]);

  // Filter and sort products
  const filteredAndSortedProducts = products
    .filter((prod) => {
      // סינון לפי חיפוש
      const matchesSearch = !searchTerm || 
        prod.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prod.sku?.toString().includes(searchTerm);

      // סינון לפי קטגוריה
      const matchesCategory = !selectedCategory || 
        prod.categoryId === parseInt(selectedCategory);

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (!sortField) {
        if (a.position === null || a.position === undefined) return 1;
        if (b.position === null || b.position === undefined) return -1;
        return a.position - b.position;
      }
      
      const aValue = a[sortField] || false;
      const bValue = b[sortField] || false;
      
      if (sortDirection === 'asc') {
        return bValue === aValue ? 0 : bValue ? 1 : -1;
      } else {
        return bValue === aValue ? 0 : bValue ? -1 : 1;
      }
    })
    // Apply limit if not 'ALL'
    .slice(0, displayLimit === 'ALL' ? undefined : parseInt(displayLimit));

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>🛠️ Admin: Products Management</h2>

      <div className={styles.actions}>
        <button onClick={handleDeleteAll} className={styles.deleteButton}>
          🗑️ Delete All Products
        </button>

        <button onClick={handleUploadFromJson} className={styles.uploadButton}>
          ⬆️ Upload from JSON
        </button>

        <button onClick={handleDownloadExcel} className={styles.downloadButton}>
          ⬇️ Download to Excel
        </button>

        <UploadExcelButton onUploadSuccess={fetchProducts} />
      </div>
      
      <div className={styles.topActions}>
        <div className={styles.categoryFilter}>
          <select
            value={displayLimit}
            onChange={(e) => setDisplayLimit(e.target.value)}
            className={styles.limitSelect}
          >
            <option value="50">50 מוצרים</option>
            <option value="200">200 מוצרים</option>
            <option value="500">500 מוצרים</option>
            <option value="ALL">הכל</option>
          </select>
          <input
            type="text"
            placeholder="🔍 חיפוש בקטגוריות..."
            value={categorySearchTerm}
            onChange={(e) => setCategorySearchTerm(e.target.value)}
            className={styles.categorySearchInput}
          />
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className={styles.categorySelect}
          >
            <option value="">כל קטגוריות הקצה ({filteredCategories.length})</option>
            {filteredCategories.length > 0 ? (
              filteredCategories.map(cat => (
                <option 
                  key={cat.categoryId} 
                  value={cat.categoryId}
                  disabled={!cat.isActive}
                >
                  {cat.categoryName} ({cat.categoryId})
                </option>
              ))
            ) : (
              <option disabled>טוען קטגוריות...</option>
            )}
          </select>
        </div>

        <input
          type="text"
          placeholder="🔍 חיפוש לפי שם או SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.productSearchInput}
        />
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">SKU</th>
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">Category</th>
            <th className="border px-2 py-1">מידוף</th>
            <th className="border px-2 py-1">Price</th>
            <th className="border px-2 py-1">Instead</th>
            <th className="border px-2 py-1">Sale Price</th>
            <th className="border px-2 py-1">Image</th>
            <th className="border px-2 py-1" onClick={() => handleSort('active')} style={{ cursor: 'pointer' }}>
              Active {sortField === 'active' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th className="border px-2 py-1" onClick={() => handleSort('isSale')} style={{ cursor: 'pointer' }}>
              Sale {sortField === 'isSale' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th className="border px-2 py-1" onClick={() => handleSort('homeSaleProducts')} style={{ cursor: 'pointer' }}>
              Home Sale {sortField === 'homeSaleProducts' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedProducts.map((prod) => (
            <tr key={prod.sku}>
              <td className="border px-2 py-1">{prod.sku}</td>
              <td className="border px-2 py-1">
                <input
                  type="text"
                  value={prod.productName || ""}
                  onChange={(e) => handleFieldChange(prod.sku, "productName", e.target.value)}
                  className={styles.editableField}
                />
              </td>
              <td className="border px-2 py-1">{prod.categoryName || '-'}</td>
              <td className="border px-2 py-1">
                <input
                  type="number"
                  value={prod.position ?? ''}
                  onChange={(e) => handleFieldChange(prod.sku, "position", e.target.value ? parseInt(e.target.value) : null)}
                  className={`${styles.editableField} ${styles.positionField}`}
                />
              </td>
              <td className="border px-2 py-1">
                <input
                  type="number"
                  value={Number(prod.price || 0).toFixed(2)}
                  onChange={(e) => handleFieldChange(prod.sku, "price", parseFloat(e.target.value))}
                  className={`${styles.editableField} ${styles.priceField}`}
                  step="0.01"
                />
              </td>
              <td className="border px-2 py-1">
                <input
                  type="number"
                  value={Number(prod.priceInstead || 0).toFixed(2)}
                  onChange={(e) => handleFieldChange(prod.sku, "priceInstead", parseFloat(e.target.value))}
                  className={`${styles.editableField} ${styles.priceField}`}
                  step="0.01"
                />
              </td>
              <td className="border px-2 py-1">
                {((prod.priceInstead || 0) - (prod.price || 0)).toFixed(2)}
              </td>
              <td className="border px-2 py-1">
                <img 
                  src={`/images/${prod.sku}.jpg`}
                  alt={prod.productName}
                  width="50"
                  onError={(e) => {
                    if (e.target.src.endsWith('.jpg')) {
                      e.target.src = `/images/${prod.sku}.png`;
                    } else {
                      e.target.src = '/images/default.jpg';
                    }
                  }}
                />
              </td>
              <td className="border px-2 py-1">
                <input
                  type="checkbox"
                  checked={prod.active || false}
                  onChange={(e) => handleFieldChange(prod.sku, "active", e.target.checked)}
                  className={styles.checkbox}
                />
              </td>
              <td className="border px-2 py-1">
                <input
                  type="checkbox"
                  checked={prod.isSale || false}
                  onChange={(e) => handleFieldChange(prod.sku, "isSale", e.target.checked)}
                  className={styles.checkbox}
                />
              </td>
              <td className="border px-2 py-1">
                <input
                  type="checkbox"
                  checked={prod.homeSaleProducts || false}
                  onChange={(e) => handleFieldChange(prod.sku, "homeSaleProducts", e.target.checked)}
                  className={styles.checkbox}
                />
              </td>
              <td className="border px-2 py-1">
                <div className={styles.actionButtons}>
                  <button 
                    onClick={() => handleEdit(prod.sku)} 
                    className={styles.iconButton}
                    title="Edit"
                  >
                    <FaEdit className="text-blue-600" />
                  </button>
                  <button 
                    onClick={() => handleDelete(prod.sku)} 
                    className={styles.iconButton}
                    title="Delete"
                  >
                    <FaTrashAlt className="text-red-600" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminProducts;
