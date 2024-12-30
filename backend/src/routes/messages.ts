import express from 'express';
import auth from '../middleware/auth';
import Message from '../models/message';

const router = express.Router();

// Debug için middleware
router.use((req, res, next) => {
  console.log('Messages Route:', req.method, req.url);
  next();
});

// POST /api/messages/conversation
router.post('/conversation', auth, async (req, res) => {
  try {
    const { sender_id, receiver_id } = req.body;
    console.log('Mesaj isteği:', { sender_id, receiver_id }); // Debug için

    const messages = await Message.find({
      $or: [
        { sender_id, receiver_id },
        { sender_id: receiver_id, receiver_id: sender_id }
      ]
    }).sort({ createdAt: 1 });

    console.log('Bulunan mesaj sayısı:', messages.length); // Debug için
    res.json(messages);
  } catch (error) {
    console.error('Mesaj getirme hatası:', error);
    res.status(500).json({ error: 'Mesajlar alınamadı' });
  }
});

// POST /api/messages
router.post('/', auth, async (req, res) => {
  try {
    const { sender_id, receiver_id, content } = req.body;

    const message = new Message({
      sender_id,
      receiver_id,
      content
    });

    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Mesaj gönderilemedi' });
  }
});

export default router; 