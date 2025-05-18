const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Product = require("../models/Product");

const run = async () => {
  try {
    // ✅ התחברות ל־MongoDB בענן Atlas עם שם משתמש וסיסמה
    await mongoose.connect(
      "mongodb+srv://rBKlDpmDH1KaKS9q:rBKlDpmDH1KaKS9q@cluster0.8qnzj.mongodb.net/final-products?retryWrites=true&w=majority&appName=Cluster0"
    );

    const allProducts = await Product.find({});
    const missing = [];

    const imagesFolder = path.join(__dirname, "../../client/public/images");

    allProducts.forEach((product) => {
      const filePath = path.join(imagesFolder, product.image || "");
      if (!fs.existsSync(filePath)) {
        missing.push({
          sku: product.sku,
          image: product.image,
          _id: product._id,
        });
      }
    });

    console.log(`🧯 נמצאו ${missing.length} מוצרים שהתמונה לא קיימת בפועל:\n`);
    missing.forEach((m) => console.log(`❌ SKU: ${m.sku}, תמונה: ${m.image}`));

    await Product.deleteMany({ _id: { $in: missing.map((m) => m._id) } });

    await mongoose.disconnect();
    console.log("✅ בוצע ניתוק מהמסד");
  } catch (err) {
    console.error("❌ שגיאה:", err.message);
  }
};

run();
