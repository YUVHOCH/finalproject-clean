const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

async function initEmbeddings() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected successfully');

        // עדכון כל המוצרים - הוספת שדות האמבדינג עם ערך null
        const result = await Product.updateMany(
            {}, // מעדכן את כל המסמכים
            { 
                $set: { 
                    shortEmb: null,
                    longEmb: null
                }
            }
        );

        console.log('=== Update Results ===');
        console.log(`Matched documents: ${result.matchedCount}`);
        console.log(`Modified documents: ${result.modifiedCount}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
}

initEmbeddings(); 