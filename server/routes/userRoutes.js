// routes/auth.js
const express = require('express');
const { loginUser, registerUser, search,updateNotificationPreferences, changeEmail, deleteAccount} = require('../controllers/userControllers');
const router = express.Router();
const upload = require('../controllers/multerconfig'); // Ensure this path is correct
const authMiddleware = require('../middleware/authMiddleware');
// Import your controller

// Route with multer middleware for file upload
router.post('/register', upload.single('profilePicture'), registerUser);
// Register a new user
router.post('/register', registerUser);

// Login user
router.post('/login', loginUser);
router.get('/search', authMiddleware, search);
// Update notification preferences


// Change email
router.put('/email', authMiddleware, changeEmail);

// Delete account
router.delete('/delete', authMiddleware, deleteAccount);
// Change user password (with current password for security)
router.put('/users/change-password', authMiddleware, authController.changePassword);

// Change profile picture (upload image using multer)
router.put('/users/change-profile-picture', authMiddleware, upload.single('profilePicture'), authController.changeProfilePicture);

module.exports = router;
