const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

async function checkEmbeddings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // בדיקת מספר המוצרים הכולל
    const totalProducts = await Product.countDocuments();
    console.log(`Total products in DB: ${totalProducts}`);

    // בדיקת מוצרים עם אמבדינגים
    const productsWithEmb = await Product.countDocuments({
      $or: [
        { shortEmb: { $exists: true, $ne: null } },
        { longEmb: { $exists: true, $ne: null } }
      ]
    });
    console.log(`Products with embeddings: ${productsWithEmb}`);

    // בדיקת דוגמה של מוצר אחד
    const sampleProduct = await Product.findOne({});
    console.log('Sample product fields:', Object.keys(sampleProduct._doc));
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

checkEmbeddings(); 