const { Router } = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const router = Router();

// Import all user controllers
const { sendMessage, getMessages } = require('../controllers/messageControllers');

router.post('/', authMiddleware, sendMessage);
router.get('/:chatId', authMiddleware, getMessages);


module.exports = router;