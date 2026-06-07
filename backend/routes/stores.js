const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Admin only: create a new store
router.post('/create', authenticateToken, authorizeRoles('ADMIN'), storeController.createStore);

// Logged-in users can list stores (Normal Users see overall/submitted ratings, Admins see all, Owners see their own stores)
router.get('/list', authenticateToken, storeController.getStoresList);

module.exports = router;
