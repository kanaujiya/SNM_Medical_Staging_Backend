const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/auth');
const searchController = require('../controllers/searchController');

router.post('/master', authenticateToken, searchController.masterSearch);

// 📤 Export grid data
router.post('/export', authenticateToken, searchController.exportSearch);

// ✅ Approve user
router.post('/approve/:regId', authenticateToken, searchController.approveUser);

// 🔄 Update selected users
router.put('/update', authenticateToken, searchController.updateSelected);

module.exports = router;
