const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/messageController');
const auth = require('../middleware/auth');

// Tüm message route'ları için auth gerekli
router.use(auth);

router.post('/send', MessageController.sendMessage);
router.get('/between/:user1_id/:user2_id', MessageController.getMessagesBetweenUsers);
router.put('/read/:messageId', MessageController.markMessageAsRead);
router.get('/unread/:userId', MessageController.getUnreadMessages);

module.exports = router; 