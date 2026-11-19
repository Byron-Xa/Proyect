const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const validateLogin = require('../middlewares/validateLogin');
const loginLimiter = require('../middlewares/loginLimiter');

router.post('/login',loginLimiter, validateLogin, authController.login);

module.exports = router;