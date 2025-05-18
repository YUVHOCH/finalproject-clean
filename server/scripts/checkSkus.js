const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

async function checkSkuTypes() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected successfully');

        // קבלת מוצר אחד לדוגמה
        const sampleProduct = await Product.findOne();
        console.log('\nSample Product SKU:', {
            value: sampleProduct.sku,
            type: typeof sampleProduct.sku,
            schema: Product.schema.obj.sku
        });

        // נסיון למצוא את אותו מוצר בכמה דרכים
        const skuToFind = sampleProduct.sku;
        console.log('\nTrying to find SKU:', skuToFind);

        const findAsIs = await Product.findOne({ sku: skuToFind });
        const findAsString = await Product.findOne({ sku: skuToFind.toString() });
        const findAsNumber = await Product.findOne({ sku: Number(skuToFind) });

        console.log('Found as is:', findAsIs ? 'Yes' : 'No');
        console.log('Found as string:', findAsString ? 'Yes' : 'No');
        console.log('Found as number:', findAsNumber ? 'Yes' : 'No');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nMongoDB connection closed');
    }
}

checkSkuTypes(); 