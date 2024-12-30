const Message = require('../models/message');
const logger = require('../config/logger');

class MessageController {
  // İki kullanıcı arasındaki mesajları getir
  async getMessagesBetweenUsers(req, res) {
    try {
      const { senderId, receiverId } = req.params;
      logger.info('Mesajlar istendi:', { senderId, receiverId });

      // Mesajları her iki yönde de ara
      const messages = await Message.find({
        $or: [
          { sender_id: senderId, receiver_id: receiverId },
          { sender_id: receiverId, receiver_id: senderId }
        ]
      }).sort({ createdAt: 1 });

      logger.info(`${messages.length} mesaj bulundu`);
      res.json(messages);
    } catch (error) {
      logger.error('Mesajlar getirilirken hata:', error);
      res.status(500).json({ error: 'Mesajlar alınırken bir hata oluştu' });
    }
  }

  // Yeni mesaj gönder
  async sendMessage(req, res) {
    try {
      const { sender_id, receiver_id, content } = req.body;
      logger.info('Yeni mesaj gönderiliyor:', { sender_id, receiver_id });

      if (!content || !content.trim()) {
        return res.status(400).json({ error: 'Mesaj içeriği boş olamaz' });
      }

      const message = new Message({
        sender_id,
        receiver_id,
        content: content.trim()
      });

      await message.save();
      logger.info('Yeni mesaj kaydedildi:', { messageId: message._id });
      res.status(201).json(message);
    } catch (error) {
      logger.error('Mesaj gönderilirken hata:', error);
      res.status(500).json({ error: 'Mesaj gönderilemedi' });
    }
  }

  // Okunmamış mesajları getir
  async getUnreadMessages(req, res) {
    try {
      const { userId } = req.params;
      logger.info('Okunmamış mesajlar istendi:', { userId });

      const messages = await Message.find({
        receiver_id: userId,
        is_read: false
      }).sort({ createdAt: -1 });

      logger.info(`${messages.length} okunmamış mesaj bulundu`);
      res.json(messages);
    } catch (error) {
      logger.error('Okunmamış mesajlar getirilirken hata:', error);
      res.status(500).json({ error: 'Okunmamış mesajlar alınırken bir hata oluştu' });
    }
  }

  // Mesajları okundu olarak işaretle
  async markMessagesAsRead(req, res) {
    try {
      const { messageIds } = req.body;
      logger.info('Mesajlar okundu olarak işaretleniyor:', { messageIds });

      const result = await Message.updateMany(
        { _id: { $in: messageIds } },
        { $set: { is_read: true } }
      );

      logger.info(`${result.modifiedCount} mesaj okundu olarak işaretlendi`);
      res.json({ success: true, modifiedCount: result.modifiedCount });
    } catch (error) {
      logger.error('Mesajlar okundu işaretlenirken hata:', error);
      res.status(500).json({ error: 'Mesajlar okundu olarak işaretlenemedi' });
    }
  }
}

module.exports = new MessageController(); 