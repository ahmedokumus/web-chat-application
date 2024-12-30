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
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'false');
  
  // OPTIONS isteklerini hemen yanıtla
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Socket.IO servisini başlat
const socketService = new SocketService(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: false
  }
});

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