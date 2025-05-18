//routs/admin
const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const authMiddleware = require('../middleware/authMiddleware');
const Product = require('../models/Product');
const User = require('../models/User');

  // דף ניהול כללי
router.get('/', verifyAdmin, (req, res) => {
    res.send("✅ Welcome Admin: גישה אושרה");
  });

  router.get('/admin', verifyAdmin, (req, res) => {
    res.json({ message: 'Welcome to the admin panel!' });
  });

router.get('/protected-route', authMiddleware, (req, res) => {
    res.json({ message: 'This is a protected route' });
  });

  // ניהול מוצרים
// שליפת כל המוצרים
router.get('/products', verifyAdmin, async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
    });

// הוספת מוצר חדש
router.post('/products', verifyAdmin, async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const saved = await newProduct.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Error creating product', error: err });
  }
    });

// מחיקת מוצר לפי ID
router.delete('/products/:id', verifyAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting product', error: err });
  }
    });

//
// 🔽 ניהול משתמשים
//

// שליפת כל המשתמשים (admin בלבד)
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err });
  }
});

// שליפת פרטי משתמש מחובר (user רגיל או admin)
router.get('/users/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile', error: err });
  }
});

// מחיקת משתמש לפי ID (admin בלבד)
router.delete('/users/:id', verifyAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user', error: err });
  }
});

module.exports = router;



