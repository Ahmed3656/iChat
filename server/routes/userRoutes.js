const express = require('express');
const { loginUser, registerUser, search, editUser, deleteAccount, changeProfilePicture } = require('../controllers/userControllers');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/search', authMiddleware, search);
router.patch('/edituser', authMiddleware, editUser);
router.post('/change-profile-picture', authMiddleware, changeProfilePicture);
router.delete('/delete', authMiddleware, deleteAccount);

module.exports = router;