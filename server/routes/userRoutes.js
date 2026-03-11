const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleGuard');
const loggerMiddleware = require('../middleware/loggerMiddleware');

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(requireRole(['admin']));

// POST /api/users - Create new user
router.post('/', loggerMiddleware, userController.createUser);

// GET /api/users - Get all users with pagination
router.get('/', userController.getAllUsers);

// PUT /api/users/:id - Update user
router.put('/:id', loggerMiddleware, userController.updateUser);

// DELETE /api/users/:id - Delete user
router.delete('/:id', loggerMiddleware, userController.deleteUser);

module.exports = router;
