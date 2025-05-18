//Middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // כאן צריך לשים את הנתיב למודל המשתמש שלך

module.exports = async (req, res, next) => {
  try {
    // בדיקה האם יש Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication token missing' });
    }

    // אימות הטוקן
    const decoded = jwt.verify(token, "SECRET123");
    const user = await User.findById(decoded.id); // מוצא את המשתמש על פי המזהה שבטוקן
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // הוספת פרטי המשתמש ל-req.user
    req.user = user;
    next(); // מעביר לבקשה הבאה
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
