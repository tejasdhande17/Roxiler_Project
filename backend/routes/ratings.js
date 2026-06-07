const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Normal Users only: Submit / Modify ratings
router.post('/submit', authenticateToken, authorizeRoles('USER'), ratingController.submitRating);
router.put('/modify', authenticateToken, authorizeRoles('USER'), ratingController.modifyRating);

// Store Owners only: View list of users who rated their stores
router.get('/owner-list', authenticateToken, authorizeRoles('STORE_OWNER'), ratingController.getStoreRatings);

module.exports = router;
