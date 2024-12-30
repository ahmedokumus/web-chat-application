const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  is_read: {
    type: Boolean,
    default: false
  },
  read_at: {
    type: Date,
    default: null
  },
  message_type: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  file_url: {
    type: String,
    default: null
  }
}, {
  timestamps: true // Bu seçenek otomatik olarak createdAt ve updatedAt alanlarını ekler
});

// Mesajları tarih sırasına göre sıralama için index
messageSchema.index({ createdAt: 1 });

// Kullanıcı bazlı mesaj araması için bileşik index
messageSchema.index({ sender_id: 1, receiver_id: 1 });

module.exports = mongoose.model('Message', messageSchema); 