const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateRegister, validatePasswordUpdate } = require('../middleware/validate');

// Any logged-in user can update their password
router.put('/password', authenticateToken, validatePasswordUpdate, userController.updatePassword);

// System Administrator only routes
router.get('/stats', authenticateToken, authorizeRoles('ADMIN'), userController.getStats);
router.get('/list', authenticateToken, authorizeRoles('ADMIN'), userController.getUsersList);
router.get('/owners', authenticateToken, authorizeRoles('ADMIN'), userController.getStoreOwners);
router.post('/create', authenticateToken, authorizeRoles('ADMIN'), validateRegister, userController.createUser);

module.exports = router;
