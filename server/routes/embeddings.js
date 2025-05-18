const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

// הגדרת multer לטיפול בקבצים
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '..', 'uploads');
        // יצירת תיקיית uploads אם לא קיימת
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, 'embeddings-' + Date.now() + '.csv');
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed'));
        }
    }
});

// נתיב להעלאת קובץ CSV
router.post('/upload-csv', upload.single('file'), async (req, res) => {
    console.log('=== Starting CSV Upload ===');
    
    if (!req.file) {
        console.log('No file received');
        return res.status(400).json({ error: 'No file uploaded' });
    }

    let successCount = 0;
    let errorCount = 0;
    let notFoundCount = 0;

    try {
        const results = [];
        
        // קריאת הקובץ
        await new Promise((resolve, reject) => {
            fs.createReadStream(req.file.path)
                .pipe(csv())
                .on('data', (data) => {
                    console.log('=== Reading CSV Row ===');
                    console.log('Row data:', {
                        sku: data.sku,
                        shortEmbLength: data.shortEmb?.length,
                        longEmbLength: data.longEmb?.length
                    });
                    results.push(data);
                })
                .on('end', resolve)
                .on('error', reject);
        });

        console.log(`Found ${results.length} products in CSV`);

        // עדכון כל מוצר
        for (const row of results) {
            try {
                console.log('\n=== Processing Product ===');
                const searchSku = Number(row.sku);
                console.log('SKU details:', {
                    original: row.sku,
                    converted: searchSku,
                    isNaN: isNaN(searchSku)
                });

                const product = await Product.findOne({ sku: searchSku });
                console.log('Product search result:', {
                    found: !!product,
                    productSku: product?.sku
                });

                if (!product) {
                    console.log(`Product not found: ${searchSku}`);
                    notFoundCount++;
                    continue;
                }

                // המרת המחרוזות למערכים
                console.log('=== Parsing Embeddings ===');
                console.log('Raw shortEmb sample:', row.shortEmb?.substring(0, 100));
                console.log('Raw longEmb sample:', row.longEmb?.substring(0, 100));

                try {
                    const shortEmbArray = JSON.parse(row.shortEmb);
                    const longEmbArray = JSON.parse(row.longEmb);
                    
                    console.log('Parsed arrays:', {
                        shortEmbLength: shortEmbArray.length,
                        longEmbLength: longEmbArray.length,
                        shortEmbType: Array.isArray(shortEmbArray),
                        longEmbType: Array.isArray(longEmbArray)
                    });

                    const updateResult = await Product.updateOne(
                        { sku: searchSku },
                        { 
                            $set: {
                                shortEmb: shortEmbArray,
                                longEmb: longEmbArray
                            }
                        }
                    );
                    
                    console.log('Update result:', updateResult);
                    
                    if (updateResult.modifiedCount > 0) {
                        successCount++;
                        console.log(`Successfully updated product ${searchSku}`);
                    }
                } catch (parseError) {
                    console.error('Parsing error:', {
                        message: parseError.message,
                        stack: parseError.stack
                    });
                    errorCount++;
                }
            } catch (error) {
                console.error('Processing error:', {
                    message: error.message,
                    stack: error.stack
                });
                errorCount++;
            }
        }

        // מחיקת הקובץ הזמני
        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            stats: {
                total: results.length,
                updated: successCount,
                notFound: notFoundCount,
                errors: errorCount
            }
        });

    } catch (error) {
        console.error('Fatal error:', error);
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 