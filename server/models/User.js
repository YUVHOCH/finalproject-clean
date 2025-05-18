const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user', enum: ['user', 'admin', 'editor'] },
  name: { type: String, required: true }, // שם מלא (fname + lname)
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  birth_date: { type: Date },
  subscribe: { type: Boolean },
  status: { type: Boolean, default: true },
  isAdmin: { type: Boolean, default: false },
  preferences: {
    page_size: { type: Number, default: 12 }
  }
});

// הצפנת סיסמה לפני שמירה
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('User', userSchema);