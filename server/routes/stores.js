const express = require('express');
const router = express.Router();
const Store = require('../models/Store');

// Get all stores
router.get('/', async (req, res) => {
  try {
    const stores = await Store.find({});
    res.json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ message: error.message });
  }
});

// Bulk upsert stores - עדכון או הוספת חנויות בבת אחת
router.post('/bulk', async (req, res) => {
  try {
    let stores = req.body;
    
    // וידוא שקיבלנו מערך
    if (!Array.isArray(stores)) {
      // אם קיבלנו אובייקט בודד, נהפוך אותו למערך
      stores = [stores];
    }

    // ולידציה בסיסית לכל חנות
    for (const store of stores) {
      if (!store.storeId) {
        return res.status(400).json({ 
          message: 'כל חנות חייבת לכלול storeId',
          invalidStore: store 
        });
      }
    }

    const operations = stores.map(store => ({
      updateOne: {
        filter: { storeId: store.storeId },
        update: { 
          $set: {
            storeName: store.storeName,
            storePhone: store.storePhone,
            storeAddress: store.storeAddress,
            storeCity: store.storeCity,
            storeStreet: store.storeStreet,
            storeStreetNumber: store.storeStreetNumber,
            storeCord: store.storeCord || "0,0",
            storeEmail: store.storeEmail,
            storeDescription: store.storeDescription || "",
            storeRegion: store.storeRegion,
            openHours: store.openHours || 'א-ה 09:00-19:00, ו 09:00-14:00',
            googlemaplink: store.googlemaplink || 
              `https://www.google.com/maps/search/${encodeURIComponent(
                `${store.storeStreet} ${store.storeStreetNumber}, ${store.storeCity}`
              )}`,
            isWarehouse: store.isWarehouse || false,
            isActive: store.isActive !== undefined ? store.isActive : true
          }
        },
        upsert: true
      }
    }));

    const result = await Store.bulkWrite(operations);
    
    res.json({
      success: true,
      message: 'החנויות עודכנו בהצלחה',
      stats: {
        matched: result.matchedCount,
        modified: result.modifiedCount,
        upserted: result.upsertedCount
      }
    });

  } catch (error) {
    console.error('Error in bulk upsert:', error);
    res.status(500).json({ 
      success: false,
      message: 'שגיאה בעדכון החנויות',
      error: error.message,
      details: error.errors
    });
  }
});

// Get store by ID
router.get('/:id', async (req, res) => {
  try {
    const store = await Store.findOne({ storeId: req.params.id });
    if (!store) {
      return res.status(404).json({ message: 'החנות לא נמצאה' });
    }
    res.json(store);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new store
router.post('/', async (req, res) => {
  const store = new Store(req.body);
  try {
    const newStore = await store.save();
    res.status(201).json(newStore);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update store
router.put('/:id', async (req, res) => {
  try {
    const store = await Store.findOneAndUpdate(
      { storeId: req.params.id },
      req.body,
      { new: true }
    );
    if (!store) {
      return res.status(404).json({ message: 'החנות לא נמצאה' });
    }
    res.json(store);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete store
router.delete('/:id', async (req, res) => {
  try {
    const store = await Store.findOneAndDelete({ storeId: req.params.id });
    if (!store) {
      return res.status(404).json({ message: 'החנות לא נמצאה' });
    }
    res.json({ message: 'החנות נמחקה בהצלחה' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 