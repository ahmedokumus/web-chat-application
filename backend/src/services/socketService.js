const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

class SocketService {
  constructor(server, corsOptions) {
    this.io = new Server(server, {
      cors: {
        origin: corsOptions.origin,
        methods: ['GET', 'POST'],
        credentials: false,
        transports: ['websocket', 'polling']
      },
      allowEIO3: true,
      pingTimeout: 60000,
      pingInterval: 25000
    });

    // Token doğrulama middleware'i
    this.io.use((socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Yetkilendirme token\'ı bulunamadı'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.userId;
        next();
      } catch (error) {
        logger.error('Socket yetkilendirme hatası:', error);
        next(new Error('Geçersiz token'));
      }
    });

    this.io.on('connection', (socket) => {
      logger.info('Yeni socket bağlantısı:', socket.id);

      // Kullanıcı yazıyor olayı
      socket.on('typing', (data) => {
        socket.broadcast.emit('user_typing', {
          userId: socket.userId,
          ...data
        });
      });

      // Kullanıcı yazmayı bıraktı olayı
      socket.on('stop_typing', (data) => {
        socket.broadcast.emit('user_stop_typing', {
          userId: socket.userId,
          ...data
        });
      });

      // Mesaj gönderme olayı
      socket.on('send_message', (message) => {
        this.io.emit('receive_message', message);
      });

      // Bağlantı koptuğunda
      socket.on('disconnect', () => {
        logger.info('Socket bağlantısı koptu:', socket.id);
      });

      // Hata durumunda
      socket.on('error', (error) => {
        logger.error('Socket hatası:', error);
      });
    });
  }
}

module.exports = SocketService; 