const express = require('express');
const { loginUser, registerUser, search, editUser, deleteAccount, changeProfilePicture } = require('../controllers/userControllers');
const router = express.Router();
const upload = require('../controllers/multerconfig');
const authMiddleware = require('../middleware/authMiddleware');

// Register a new user (with file upload)
router.post('/register', registerUser);

// Login user
router.post('/login', loginUser);

// Search users
router.get('/search', authMiddleware, search);

// Edit user info
router.patch('/edituser', authMiddleware, editUser);
router.post('/change-profile-picture', authMiddleware, changeProfilePicture);

// Delete account
router.delete('/delete', authMiddleware, deleteAccount);

module.exports = router;