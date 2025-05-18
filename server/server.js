// server/server.js

require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const NodeCache = require('node-cache');
const app = express();
const brandsRouter = require('./routes/brands');
const storesRouter = require('./routes/stores');

// יצירת מטמון עם TTL של 5 דקות
const cache = new NodeCache({ stdTTL: 300 });

// חשיפת המטמון לשאר הקבצים
app.set('cache', cache);

// הדפסת בדיקת סביבה
console.log('Environment check:', {
  MONGODB_URI: !!process.env.MONGODB_URI,
  OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
  OPENAI_API_KEY_LENGTH: process.env.OPENAI_API_KEY?.length,
  PORT: process.env.PORT
});

const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const adminRoutes = require('./routes/admin');
const categoriesRouter = require('./routes/categories');

// טעינת הראוטר החדש
const aiSearchRouter = require('./routes/aiSearch');
const embeddingsRouter = require('./routes/embeddings');

// 🔌 Middlewares
app.use(express.json());
app.use(cors());

// 🔁 טעינת ראוטים
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/admin', adminRoutes);
app.use('/brands', brandsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/stores', storesRouter);
app.use('/api/ai-search', aiSearchRouter);
app.use('/api/embeddings', embeddingsRouter);

// ✅ דף ראשי לבדיקה
app.get('/', (req, res) => {
  res.send('🎉 Welcome to the API root route!');
});

// ❌ טיפול בנתיב שלא קיים
app.use((req, res) => {
  res.status(404).json({ error: "Route not found: " + req.originalUrl });
});

// 🔗 התחברות למסד MongoDB בענן
mongoose.connect(
  'mongodb+srv://rBKlDpmDH1KaKS9q:rBKlDpmDH1KaKS9q@cluster0.8qnzj.mongodb.net/final-products?retryWrites=true&w=majority&appName=Cluster0',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    minPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  }
)
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// 🟢 הרצת השרת
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
