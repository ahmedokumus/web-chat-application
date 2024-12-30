const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('\x1b[32m%s\x1b[0m', '✓ MongoDB bağlantısı başarılı!');
    console.log('\x1b[36m%s\x1b[0m', `  → Host: ${connection.connection.host}`);
    console.log('\x1b[36m%s\x1b[0m', `  → Database: ${connection.connection.name}`);

    // Bağlantı hatalarını dinle
    mongoose.connection.on('error', (err) => {
      console.error('\x1b[31m%s\x1b[0m', '✗ MongoDB bağlantı hatası:', err);
    });

    // Bağlantı koptuğunda
    mongoose.connection.on('disconnected', () => {
      console.warn('\x1b[33m%s\x1b[0m', '! MongoDB bağlantısı koptu');
    });

    // Uygulama kapandığında bağlantıyı düzgün şekilde kapat
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('\x1b[33m%s\x1b[0m', '! MongoDB bağlantısı kapatıldı');
      process.exit(0);
    });

  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '✗ MongoDB bağlantı hatası:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB; 