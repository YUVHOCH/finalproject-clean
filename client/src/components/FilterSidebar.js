import React from "react";
import styles from "../styles/FilterSidebar.module.css";

const FilterSidebar = ({ 
  brands,
  selectedBrands,
  setSelectedBrands,
  priceRanges,
  selectedPriceRanges,
  setSelectedPriceRanges,
  dynamicFilters,
  setDynamicFilters,
  mowerTypes // דוגמה לפילטר עתידי
}) => {

  const handleBrandChange = (brand) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(selectedBrands.filter(b => b !== brand));
    } else {
      setSelectedBrands([...selectedBrands, brand]);
    }
  };

  const handlePriceRangeChange = (range) => {
    if (selectedPriceRanges.includes(range)) {
      setSelectedPriceRanges(selectedPriceRanges.filter(r => r !== range));
    } else {
      setSelectedPriceRanges([...selectedPriceRanges, range]);
    }
  };

  const handleDynamicFilterChange = (filterName, value) => {
    const currentValues = dynamicFilters[filterName] || [];
    if (currentValues.includes(value)) {
      setDynamicFilters({
        ...dynamicFilters,
        [filterName]: currentValues.filter(v => v !== value)
      });
    } else {
      setDynamicFilters({
        ...dynamicFilters,
        [filterName]: [...currentValues, value]
      });
    }
  };

  // פונקציה לניקוי כל הפילטרים
  const clearAllFilters = () => {
    setSelectedBrands([]);
    setSelectedPriceRanges([]);
    setDynamicFilters({});
  };

  // בדיקה האם יש פילטרים פעילים
  const hasActiveFilters = selectedBrands.length > 0 || 
                          selectedPriceRanges.length > 0 || 
                          Object.values(dynamicFilters).some(arr => arr?.length > 0);

  return (
    <div className={styles.filterSidebar}>
      <div className={styles.filterHeader}>
        <h1>סינון</h1>
        {hasActiveFilters && (
          <button 
            onClick={clearAllFilters}
            className={styles.clearButton}
          >
            נקה הכל
          </button>
        )}
      </div>

      {/* מותגים - מוצג רק אם יש יותר ממותג אחד */}
      {brands && brands.length > 1 && (
        <div className={styles.filterGroup}>
          <h3>מותג</h3>
          <div className={styles.checkboxGroup}>
            {brands.map((brand) => (
              <label key={brand} className={styles.checkboxItem}>
                <input 
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => handleBrandChange(brand)}
                />
                <span>{brand}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* טווחי מחיר - מוצג תמיד כי יש מספר אפשרויות קבועות */}
      <div className={styles.filterGroup}>
        <h3>טווח מחיר</h3>
        <div className={styles.checkboxGroup}>
          {priceRanges.map((range) => (
            <label key={range.value} className={styles.checkboxItem}>
              <input 
                type="checkbox"
                checked={selectedPriceRanges.includes(range.value)}
                onChange={() => handlePriceRangeChange(range.value)}
              />
              <span>{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* פילטרים דינמיים - מוצג רק אם יש יותר מערך אחד */}
      {mowerTypes && mowerTypes.length > 1 && (
        <div className={styles.filterGroup}>
          <h3>סוג מכסחת</h3>
          <div className={styles.checkboxGroup}>
            {mowerTypes.map((type) => (
              <label key={type} className={styles.checkboxItem}>
                <input 
                  type="checkbox"
                  checked={(dynamicFilters.mowerType || []).includes(type)}
                  onChange={() => handleDynamicFilterChange('mowerType', type)}
                />
                <span>{type}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterSidebar; 