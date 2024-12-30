const Message = require('../models/message');

class MessageController {
  // Mesaj gönderme
  async sendMessage(req, res) {
    try {
      const { receiver_id, content, message_type = 'text' } = req.body;
      const sender_id = req.user._id;

      const message = new Message({
        sender_id,
        receiver_id,
        content,
        message_type
      });

      await message.save();

      // Socket.IO mesaj gönderimi socketService üzerinden yapılacak
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // İki kullanıcı arasındaki mesajları getir
  async getMessagesBetweenUsers(req, res) {
    try {
      const { user1_id, user2_id } = req.params;

      const messages = await Message.find({
        $or: [
          { sender_id: user1_id, receiver_id: user2_id },
          { sender_id: user2_id, receiver_id: user1_id }
        ]
      }).sort({ createdAt: 1 });

      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Mesajı okundu olarak işaretle
  async markMessageAsRead(req, res) {
    try {
      const { messageId } = req.params;

      const message = await Message.findById(messageId);
      if (!message) {
        return res.status(404).json({ error: 'Mesaj bulunamadı' });
      }

      message.is_read = true;
      message.read_at = new Date();
      await message.save();

      res.json(message);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Kullanıcının okunmamış mesajlarını getir
  async getUnreadMessages(req, res) {
    try {
      const { userId } = req.params;

      const messages = await Message.find({
        receiver_id: userId,
        is_read: false
      }).sort({ createdAt: -1 });

      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new MessageController(); 