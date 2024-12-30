const winston = require('winston');
const path = require('path');

// Log dosyaları için dizin
const logDir = path.join(__dirname, '../../logs');

// Log formatı
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Logger instance'ı oluştur
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // Error logs
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      handleExceptions: true
    }),
    // Warning logs
    new winston.transports.File({
      filename: path.join(logDir, 'warn.log'),
      level: 'warn'
    }),
    // Info logs
    new winston.transports.File({
      filename: path.join(logDir, 'info.log'),
      level: 'info'
    }),
    // Debug logs
    new winston.transports.File({
      filename: path.join(logDir, 'debug.log'),
      level: 'debug'
    }),
    // Tüm logları içeren dosya
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log')
    })
  ],
  // Uygulama çöktüğünde log tutmaya devam et
  exitOnError: false
});

// Geliştirme ortamında console'a da log bas
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Log dizinini oluştur
const fs = require('fs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

module.exports = logger; 