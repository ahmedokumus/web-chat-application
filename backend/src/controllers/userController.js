const User = require('../models/user');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../config/jwt');
const logger = require('../config/logger');

class UserController {
  // Tüm kullanıcıları getir
  async getAllUsers(req, res) {
    try {
      const users = await User.find({}, { password: 0 }); // Şifreleri hariç tut
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Kullanıcı kaydı
  async register(req, res) {
    try {
      const { username, email, password } = req.body;

      logger.debug('Kullanıcı kaydı başlatıldı', { email, username });

      const existingUser = await User.findOne({ 
        $or: [{ email }, { username }] 
      });
      
      if (existingUser) {
        logger.warn('Kayıt denemesi: Email veya kullanıcı adı kullanımda', {
          email,
          username
        });
        return res.status(400).json({ 
          error: 'Bu email veya kullanıcı adı zaten kullanımda' 
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        username,
        email,
        password: hashedPassword
      });

      await user.save();
      
      logger.info('Yeni kullanıcı kaydı başarılı', {
        userId: user._id,
        username: user.username
      });

      const userResponse = user.toObject();
      delete userResponse.password;

      res.status(201).json(userResponse);
    } catch (error) {
      logger.error('Kullanıcı kaydı hatası:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Kullanıcı girişi
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Kullanıcı bulunamadı' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Geçersiz şifre' });
      }

      // JWT token oluştur
      const token = generateToken(user._id);

      // Kullanıcı online durumunu güncelle
      user.isOnline = true;
      await user.save();

      // Şifreyi response'dan çıkar
      const userResponse = user.toObject();
      delete userResponse.password;

      res.json({
        user: userResponse,
        token
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Kullanıcı çıkışı
  async logout(req, res) {
    try {
      const userId = req.params.id;
      
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
      }

      user.isOnline = false;
      user.lastSeen = new Date();
      await user.save();

      res.json({ message: 'Başarıyla çıkış yapıldı' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Mevcut kullanıcı bilgilerini getir
  async getCurrentUser(req, res) {
    try {
      const userResponse = req.user.toObject();
      delete userResponse.password;
      res.json(userResponse);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new UserController(); 