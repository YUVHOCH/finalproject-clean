const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  storeId: {
    type: String,
    required: true,
    unique: true
  },
  storeName: {
    type: String,
    required: true
  },
  storePhone: {
    type: String,
    required: true
  },
  storeAddress: {
    type: String,
    required: true
  },
  storeCity: {
    type: String,
    required: true
  },
  storeStreet: {
    type: String,
    required: true
  },
  storeStreetNumber: {
    type: String,
    required: true
  },
  storeCord: {
    type: String,
    required: true
  },
  storeEmail: {
    type: String,
    required: true
  },
  storeDescription: {
    type: String
  },
  storeRegion: {
    type: String,
    required: true,
    enum: ['צפון', 'שרון', 'מרכז', 'ירושלים והסביבה', 'דרום']
  },
  openHours: {
    type: String,
    required: true,
    default: 'א-ה 08:00-17:00, ו 09:00-14:00'
  },
  googlemaplink: {
    type: String,
    required: true
  },
  isWarehouse: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Store', storeSchema); 