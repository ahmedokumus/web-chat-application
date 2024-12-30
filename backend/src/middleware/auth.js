const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');
const User = require('../models/user');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new Error();
    }

    // Kullanıcı bilgisini request'e ekle
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Lütfen giriş yapın' });
  }
};

module.exports = auth; 