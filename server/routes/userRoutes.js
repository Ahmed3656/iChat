// routes/auth.js
const express = require('express');
const { loginUser, registerUser } = require('../controllers/userControllers');
const router = express.Router();

// Register a new user
router.post('/register', registerUser);

// Login user
router.post('/login', loginUser);

module.exports = router;
