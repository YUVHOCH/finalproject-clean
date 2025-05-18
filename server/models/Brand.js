const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  position: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Brand', brandSchema); 