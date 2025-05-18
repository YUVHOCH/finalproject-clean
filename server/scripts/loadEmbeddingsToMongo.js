const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

console.log('=== Starting Embeddings Upload Script ===');

// קריאת הקובץ בצורה יעילה יותר
async function readCSV() {
    const products = new Map();
    return new Promise((resolve, reject) => {
        fs.createReadStream('output_embeddings.csv')
            .pipe(csv())
            .on('data', (row) => {
                products.set(row.sku, {
                    shortEmb: row.shortEmb,
                    longEmb: row.longEmb
                });
            })
            .on('end', () => {
                console.log(`Read ${products.size} products from CSV`);
                resolve(products);
            })
            .on('error', reject);
    });
}

// עדכון המוצרים ב-chunks
async function updateProducts(productsMap) {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected successfully');

        let success = 0;
        let notFound = 0;
        let errors = 0;

        // מעבד 50 מוצרים בכל פעם
        const batchSize = 50;
        const skus = Array.from(productsMap.keys());
        
        for (let i = 0; i < skus.length; i += batchSize) {
            const batch = skus.slice(i, i + batchSize);
            console.log(`Processing batch ${i/batchSize + 1} of ${Math.ceil(skus.length/batchSize)}`);

            await Promise.all(batch.map(async (sku) => {
                try {
                    const product = await Product.findOne({ sku: Number(sku) });
                    if (!product) {
                        notFound++;
                        return;
                    }

                    const { shortEmb, longEmb } = productsMap.get(sku);
                    product.shortEmb = JSON.parse(shortEmb);
                    product.longEmb = JSON.parse(longEmb);
                    await product.save();
                    success++;
                } catch (error) {
                    errors++;
                    console.error(`Error with SKU ${sku}:`, error.message);
                }
            }));

            // מחכה קצת בין כל batch
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log('\n=== Final Results ===');
        console.log(`Successfully updated: ${success}`);
        console.log(`Not found in DB: ${notFound}`);
        console.log(`Errors: ${errors}`);

    } finally {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
}

// הרצת הסקריפט
async function main() {
    try {
        const products = await readCSV();
        await updateProducts(products);
    } catch (error) {
        console.error('Fatal error:', error);
    }
}

main(); 