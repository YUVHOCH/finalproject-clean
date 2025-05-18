// server/controllers/userController.js
const User = require('../models/User');
const bcrypt = require("bcrypt"); // 🔐 להצפנת סיסמה
const jwt = require('jsonwebtoken'); // 🔑 ליצירת טוקן JWT

// 📥 יצירת משתמש חדש
const createUser = async (req, res) => {
  try {
    const { email, username, password, ...rest } = req.body;

    // 🔎 בדיקה אם קיים כבר משתמש עם אותו אימייל או שם משתמש
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email or username already in use" });
    }

    // 🆕 יצירת אובייקט משתמש חדש עם הסיסמה המוצפנת
    const newUser = new User({
      ...rest,
      email,
      username,
      password
    });

    // 💾 שמירת המשתמש במסד הנתונים
    const savedUser = await newUser.save();

    // ✅ החזרה ללקוח
    res.status(201).json(savedUser);

  } catch (err) {
    console.error("❌ Error creating user:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// 🔐 התחברות משתמש
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  console.log("📥 ניסיון התחברות שהתקבל מהלקוח:");
  console.log("🧾 username:", username);
  console.log("🔒 password:", password);

  try {
    const user = await User.findOne({ username });

    if (!user) {
      console.log("❌ לא נמצא משתמש:", username);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("✅ נמצא משתמש ב־DB:", user.username);
    console.log("🔐 סיסמה מוצפנת ב־DB:", user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🧪 האם הסיסמה תואמת?", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        role: user.role,         // ⬅️ חשוב!
        isAdmin: user.isAdmin    // (לא חובה אם אתה עובד לפי role)
      },
      "SECRET123",
      { expiresIn: "1h" }
    );
    
    console.log("🔒 סיסמה שהוזנה:", password);
    console.log("🔐 סיסמה מוצפנת מה־DB:", user.password);
    console.log("🔑 התחברות הצליחה, מחזיר טוקן...");
    
    res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role, 
        isAdmin: user.isAdmin  
      }
    });
    

  } catch (err) {
    console.error("❌ Server login error:", err);
    res.status(500).json({ message: err.message });
  }
};

const deleteUserById = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports = {
  createUser,
  loginUser,
  deleteUserById
};


