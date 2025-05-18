import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/StoresList.module.css';

const StoresList = () => {
  const [stores, setStores] = useState([]);
  const [expandedRegion, setExpandedRegion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const regions = ['צפון', 'שרון', 'מרכז', 'ירושלים והסביבה', 'דרום'];

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/stores');
        setStores(response.data);
      } catch (error) {
        console.error('שגיאה בטעינת הסניפים:', error);
      }
    };
    fetchStores();
  }, []);

  const getStoresByRegion = (region) => {
    return stores.filter(store => store.storeRegion === region && store.isActive);
  };

  const handleRegionClick = (region) => {
    setExpandedRegion(expandedRegion === region ? null : region);
  };

  const matchesSearch = (store) => {
    if (!searchTerm) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      store.storeCity.toLowerCase().includes(searchLower) ||
      store.storeName?.toLowerCase().includes(searchLower)
    );
  };

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    
    // If there's a search term, expand the region containing the first match
    if (value) {
      const firstMatch = stores.find(store => 
        store.storeCity.toLowerCase().includes(value.toLowerCase()) ||
        store.storeName?.toLowerCase().includes(value.toLowerCase())
      );
      if (firstMatch) {
        setExpandedRegion(firstMatch.storeRegion);
      }
    }
  };

  return (
    <div className={styles.storesListContainer}>
      <h1>רשימת סניפים</h1>
      
      <div className={styles.searchContainer}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="חפש סניף"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      
      {regions.map(region => (
        <div key={region} className={styles.regionSection}>
          <button 
            className={`${styles.regionButton} ${expandedRegion === region ? styles.expanded : ''}`}
            onClick={() => handleRegionClick(region)}
          >
            {region}
          </button>
          
          {expandedRegion === region && (
            <div className={styles.storesTable}>
              <table>
                <thead>
                  <tr>
                    <th>עיר</th>
                    <th>כתובת</th>
                    <th>טלפון</th>
                    <th>שעות פתיחה</th>
                    <th>דוא"ל</th>
                    <th>ניווט</th>
                  </tr>
                </thead>
                <tbody>
                  {getStoresByRegion(region).map(store => (
                    <tr 
                      key={store.storeId}
                      className={matchesSearch(store) ? styles.highlightedRow : ''}
                    >
                      <td>{store.storeCity}</td>
                      <td>{`${store.storeStreet} ${store.storeStreetNumber}`}</td>
                      <td>{store.storePhone}</td>
                      <td>{store.openHours}</td>
                      <td>{store.storeEmail}</td>
                      <td>
                        <a 
                          href={store.googlemaplink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={styles.mapLink}
                        >
                          נווט לסניף
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StoresList; 