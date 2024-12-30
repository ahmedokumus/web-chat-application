const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Public routes
router.post('/register', UserController.register);
router.post('/login', UserController.login);

// Protected routes
router.use(auth); // Bundan sonraki tüm route'lar için auth gerekli
router.get('/me', UserController.getCurrentUser);
router.get('/', UserController.getAllUsers);
router.post('/logout/:id', UserController.logout);

module.exports = router; 