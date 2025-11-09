// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

// Login with role validation
router.post('/login', authController.login);

// Forgot password
router.post('/forgot-password-validate', authController.validateForgotPassword);
// Reset password
router.post('/reset-password', authController.resetPassword);

module.exports = router;
