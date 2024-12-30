const express = require('express');
const http = require('http');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/database');
const SocketService = require('./services/socketService');
const logger = require('./config/logger');

// MongoDB bağlantısını başlat
connectDB();

const app = express();
const server = http.createServer(app);

// CORS ayarlarını güncelle
const corsOptions = {
  origin: [
    'https://web-chat-application-indo1.vercel.app',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: false
};

app.use(cors(corsOptions));

// Socket.IO servisini başlat
const socketService = new SocketService(server, corsOptions);

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Health check endpoint ekle
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Route'ları içe aktar
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');

app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Sunucu ${PORT} portunda çalışıyor`);
});

// Beklenmeyen hataları yakala
process.on('uncaughtException', (err) => {
  logger.error('Beklenmeyen Hata:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error('İşlenmeyen Promise Reddi:', err);
  process.exit(1);
}); 