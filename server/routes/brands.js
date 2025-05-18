const express = require('express');
const router = express.Router();
const Brand = require('../models/Brand');

// GET all brands
router.get('/', async (req, res) => {
  try {
    const brands = await Brand.find();
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE brand
router.post('/', async (req, res) => {
  try {
    const { name, title, description } = req.body;
    let brand = await Brand.findOne({ name });
    
    if (!brand) {
      brand = new Brand({ name, title, description });
    } else {
      brand.title = title;
      brand.description = description;
    }
    
    const savedBrand = await brand.save();
    res.json({ 
      message: 'המותג נשמר בהצלחה',
      brand: savedBrand 
    });
  } catch (error) {
    console.error('Error saving brand:', error);
    res.status(500).json({ message: error.message });
  }
});

// UPDATE brand positions
router.post('/positions', async (req, res) => {
  try {
    const { brands } = req.body;
    
    // Update each brand's position in the database
    for (const brand of brands) {
      await Brand.findOneAndUpdate(
        { name: brand.name },
        { position: brand.position }
      );
    }
    
    res.json({ message: 'Positions updated successfully' });
  } catch (error) {
    console.error('Error updating positions:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 