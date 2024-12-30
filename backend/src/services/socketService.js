const { Server } = require('socket.io');
const Message = require('../models/message');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');
const logger = require('../config/logger');

class SocketService {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    this.userSockets = new Map(); // userId -> socketId eşleşmesi
    this.setupSocketHandlers();

    logger.info('Socket.IO servisi başlatıldı');
  }

  // Socket bağlantılarını ve olayları yönet
  setupSocketHandlers() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          throw new Error('Authentication error');
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (!user) {
          throw new Error('User not found');
        }

        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket) => {
      this.handleConnection(socket);

      socket.on('send_message', (data) => this.handleSendMessage(socket, data));
      socket.on('typing', (data) => this.handleTyping(socket, data));
      socket.on('stop_typing', (data) => this.handleStopTyping(socket, data));
      socket.on('disconnect', () => this.handleDisconnect(socket));
    });
  }

  // Yeni bağlantı yönetimi
  async handleConnection(socket) {
    try {
      const userId = socket.user._id;
      
      // Kullanıcının socket ID'sini kaydet
      this.userSockets.set(userId.toString(), socket.id);
      
      // Kullanıcıyı çevrimiçi olarak işaretle
      await User.findByIdAndUpdate(userId, { isOnline: true });
      
      socket.broadcast.emit('user_online', { userId });
      
      logger.info('Kullanıcı bağlandı', { userId });

      socket.on('disconnect', () => this.handleDisconnect(socket));
    } catch (error) {
      logger.error('Bağlantı hatası:', error);
    }
  }

  // Mesaj gönderme işlemi
  async handleSendMessage(socket, data) {
    try {
      const { sender_id, receiver_id, content } = data;
      
      // Mesajı veritabanına kaydet
      const message = new Message({
        sender_id,
        receiver_id,
        content
      });
      await message.save();

      // Alıcının socket ID'sini bul
      const receiverSocketId = this.userSockets.get(receiver_id);
      
      if (receiverSocketId) {
        // Alıcıya mesajı gönder
        this.io.to(receiverSocketId).emit('receive_message', message);
      }

      // Gönderene onay gönder
      socket.emit('message_sent', message);

      logger.info('Yeni mesaj gönderildi', { messageId: message._id });
    } catch (error) {
      logger.error('Mesaj gönderme hatası:', error);
      socket.emit('message_error', { error: 'Mesaj gönderilemedi' });
    }
  }

  // Yazıyor... durumu
  handleTyping(socket, data) {
    console.log('Backend - Yazma durumu alındı:', data);
    const { sender_id, receiver_id, characterCount } = data;
    const receiverSocketId = this.userSockets.get(receiver_id);
    if (receiverSocketId) {
      const typingData = {
        userId: socket.user._id,
        username: socket.user.username,
        characterCount
      };
      console.log('Backend - Yazma durumu gönderiliyor:', typingData);
      this.io.to(receiverSocketId).emit('user_typing', typingData);
    }
  }

  // Yazıyor... durumu sonu
  handleStopTyping(socket, data) {
    console.log('Backend - Yazma durumu durdurma alındı:', data);
    const { sender_id, receiver_id } = data;
    const receiverSocketId = this.userSockets.get(receiver_id);
    if (receiverSocketId) {
      const stopTypingData = {
        userId: socket.user._id
      };
      console.log('Backend - Yazma durumu durdurma gönderiliyor:', stopTypingData);
      this.io.to(receiverSocketId).emit('user_stop_typing', stopTypingData);
    }
  }

  // Bağlantı kopması durumu
  async handleDisconnect(socket) {
    const userId = socket.user._id;

    // Kullanıcı-socket eşleşmesini sil
    this.userSockets.delete(userId.toString());

    // Kullanıcının offline durumunu güncelle
    await User.findByIdAndUpdate(userId, {
      isOnline: false,
      lastSeen: new Date()
    });

    // Diğer kullanıcılara offline durumunu bildir
    this.io.emit('user_offline', { userId });

    console.log(`User disconnected: ${userId}`);
  }
}

module.exports = SocketService; 