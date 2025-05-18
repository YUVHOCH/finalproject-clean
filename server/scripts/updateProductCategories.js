const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');

async function updateProductCategories() {
    try {
        // התחברות למונגו
        await mongoose.connect('mongodb://localhost:27017/bizpoint');
        console.log('Connected to MongoDB');

        // מצא את כל המוצרים שאין להם categoryId
        const products = await Product.find({
            $or: [
                { categoryId: null },
                { categoryId: { $exists: false } }
            ]
        });

        console.log(`נמצאו ${products.length} מוצרים ללא categoryId`);

        // קבל את כל הקטגוריות
        const categories = await Category.find({});
        console.log(`נמצאו ${categories.length} קטגוריות`);

        let updated = 0;
        let skipped = 0;

        // עדכון כל מוצר
        for (const product of products) {
            try {
                // חיפוש קטגוריה מתאימה לפי המבנה הישן
                let matchingCategory = null;

                // נסה למצוא לפי תת-תת קטגוריה
                if (product.subsubcategory) {
                    matchingCategory = categories.find(cat => 
                        cat.categoryName === product.subsubcategory &&
                        cat.categoryLevel === 3
                    );
                }

                // אם לא נמצא, נסה לפי תת קטגוריה
                if (!matchingCategory && product.subcategory) {
                    matchingCategory = categories.find(cat => 
                        cat.categoryName === product.subcategory &&
                        cat.categoryLevel === 2
                    );
                }

                // אם עדיין לא נמצא, נסה לפי קטגוריה ראשית
                if (!matchingCategory && product.category) {
                    matchingCategory = categories.find(cat => 
                        cat.categoryName === product.category &&
                        cat.categoryLevel === 1
                    );
                }

                if (matchingCategory) {
                    // עדכון ה-categoryId של המוצר
                    await Product.findByIdAndUpdate(product._id, {
                        categoryId: matchingCategory.categoryId
                    });
                    updated++;
                    console.log(`✅ Updated product ${product.sku} with categoryId ${matchingCategory.categoryId}`);
                } else {
                    console.log(`⚠️ No matching category found for product ${product.sku}`);
                    skipped++;
                }

            } catch (err) {
                console.error(`❌ Error updating product ${product.sku}:`, err);
                skipped++;
            }
        }

        console.log(`
        סיכום:
        ========
        סה"כ מוצרים: ${products.length}
        עודכנו: ${updated}
        דולגו: ${skipped}
        `);

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// הרץ את הסקריפט
updateProductCategories(); 