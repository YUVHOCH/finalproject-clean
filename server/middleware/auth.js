// server/middleware/auth.js
const jwt = require("jsonwebtoken");

// Middleware: בדיקת תקפות הטוקן
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, "SECRET123"); // 🛑 יש לשים ב־.env בעתיד
    req.user = decoded; // ⬅️ שמירת נתוני המשתמש ב־req
    next(); // ⬅️ ממשיכים הלאה לנתיב הבא
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};

// Middleware: בדיקת הרשאת admin
const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Access denied. Admins only.' });
    }
  });
};

module.exports = {
  verifyToken,
  verifyAdmin,
};
