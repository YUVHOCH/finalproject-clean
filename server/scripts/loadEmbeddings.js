const csv = require('csv-parser');
const fs = require('fs');
const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

async function loadEmbeddings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const results = [];
    fs.createReadStream('output_embeddings.csv')
      .pipe(csv())
      .on('data', (data) => {
        results.push(data);
      })
      .on('end', async () => {
        console.log(`Loaded ${results.length} records from CSV`);
        
        for (const row of results) {
          const { sku, shortEmb, longEmb } = row;
          
          // עדכון המוצר במסד הנתונים
          await Product.updateOne(
            { sku },
            { 
              $set: {
                shortEmb: JSON.parse(shortEmb),
                longEmb: JSON.parse(longEmb)
              }
            }
          );
          console.log(`Updated embeddings for SKU: ${sku}`);
        }
        
        console.log('Finished updating embeddings');
        mongoose.connection.close();
      });
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

loadEmbeddings(); 