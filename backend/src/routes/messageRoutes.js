const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/messageController');
const auth = require('../middleware/auth');

// Tüm route'lar için auth middleware'ini kullan
router.use(auth);

// Mesaj gönderme
router.post('/send', MessageController.sendMessage);

// İki kullanıcı arasındaki mesajları getir
router.get('/between/:senderId/:receiverId', MessageController.getMessagesBetweenUsers);

// Okunmamış mesajları getir
router.get('/unread/:userId', MessageController.getUnreadMessages);

// Mesajları okundu olarak işaretle
router.post('/mark-read', MessageController.markMessagesAsRead);

module.exports = router; 