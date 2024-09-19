const { Router } = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const router = Router();

// Import all user controllers
const { accessChat, getChats, getChat, createGroupChat, renameGroup, setAdmin, removeAdmin, addToGroup, removeFromGroup, changeGroupPfp} = require('../controllers/chatControllers');

router.post('/', authMiddleware, accessChat);
router.get('/', authMiddleware, getChats);
router.get('/:chatId', authMiddleware, getChat);
router.post('/creategroup', authMiddleware, createGroupChat);
router.patch('/renamegroup', authMiddleware, renameGroup);
router.patch('/setadmin', authMiddleware, setAdmin);
router.patch('/removeadmin', authMiddleware, removeAdmin);
router.patch('/groupadd', authMiddleware, addToGroup);
router.patch('/groupremove', authMiddleware, removeFromGroup);
router.patch('/changepfp', authMiddleware, changeGroupPfp);
module.exports = router;