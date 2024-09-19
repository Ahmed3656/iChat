const { Router } = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const router = Router();

// Import all user controllers
const { sendMessage, sendAttachmentMessage, getMessages } = require('../controllers/messageControllers');

router.post('/', authMiddleware, sendMessage);
router.post('/attachment', authMiddleware, sendAttachmentMessage);
router.get('/:chatId', authMiddleware, getMessages);


module.exports = router;