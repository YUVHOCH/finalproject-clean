// server/routes/users.js
const express = require('express');
const router = express.Router();
const {createUser, loginUser, deleteUserById} = require('../controllers/userController');
const User = require('../models/User');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

router.get('/', async (req, res) => {
    try {
      const users = await User.find();
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err });
    }
  });

router.post('/', createUser);
router.post("/login", loginUser);
router.delete("/:id", deleteUserById);

module.exports = router;

