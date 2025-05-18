// ✅ קוד שמחפש מוצרים שהתמונה שלהם לא קיימת בפועל

const mongoose = require("mongoose");
const Product = require("../models/Product");

const run = async () => {
  await mongoose.connect("mongodb+srv://rBKlDpmDH1KaKS9q:rBKlDpmDH1KaKS9q@cluster0.8qnzj.mongodb.net/final-products?retryWrites=true&w=majority&appName=Cluster0");

  // מציאת מוצרים עם תמונת ברירת מחדל
  const productsWithDefaultImage = await Product.find({
    image: { $in: ["default.jpg", "", null] },
  });

  console.log("🔍 נמצאו מוצרים עם default.jpg:", productsWithDefaultImage.length);

  // ❌ אופציונלי: מחיקה
  // await Product.deleteMany({ image: { $in: ["default.jpg", "", null] } });

  mongoose.disconnect();
};

run();