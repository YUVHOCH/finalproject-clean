const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  description: String,
  price: Number,
  sku: { 
    type: Number, 
    required: true,
    index: true  // מוסיף אינדקס לשדה
  },
  brand: String,
  categoryId: { 
    type: Number,
    ref: 'Category'
  },
  category: String,
  subcategory: String,
  subsubcategory: String,
  titleDescription: String,
  shortDescription: String,
  longDescription: String,
  country: String,
  warranty: String,
  isSale: { type: Boolean, default: false },
  homeSaleProducts: { type: Boolean, default: false },
  dateCreation: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  position: { 
    type: Number, 
    default: null,
    index: true 
  },
  brandLogo: String,
  model: String,
  priceInstead: Number,
  image: String,
  active: { type: Boolean, default: true },
  // שדות חדשים עבור embeddings של OpenAI
  shortEmb: {
    type: [Number],
    default: null
  },
  longEmb: {
    type: [Number],
    default: null
  },
});

// אינדקסים
productSchema.index({ categoryId: 1 });
productSchema.index({ position: 1, categoryId: 1 }); // אינדקס משולב למיון לפי מיקום בתוך קטגוריה
productSchema.index({ updatedAt: -1 }); // אינדקס לפי תאריך עדכון

// אינדקס טקסט לחיפוש
productSchema.index({
  productName: 'text',
  description: 'text',
  shortDescription: 'text',
  longDescription: 'text',
  brand: 'text',
  category: 'text',
  subcategory: 'text',
  model: 'text'
}, {
  weights: {
    productName: 10,
    brand: 8,
    model: 7,
    shortDescription: 5,
    description: 4,
    category: 3,
    subcategory: 2,
    longDescription: 1
  },
  name: "ProductTextIndex"
});

// עדכון תאריך העדכון האחרון
productSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("Product", productSchema);
