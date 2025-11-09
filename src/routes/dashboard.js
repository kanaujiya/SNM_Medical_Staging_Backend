const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard');
const authenticateToken = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/role');

// User routes
router.get('/stats', authenticateToken, dashboardController.getStats);
router.get('/profile', authenticateToken, dashboardController.getProfile);
router.put('/profile', authenticateToken, dashboardController.updateProfile);

// Admin routes
// router.get('/users', authenticateToken, isAdmin, dashboardController.getAllUsers);
router.put('/users/:userId/presence', authenticateToken, isAdmin, dashboardController.updatePresence);
router.get('/summary', authenticateToken, isAdmin, dashboardController.getAdminSummary);

module.exports = router;
