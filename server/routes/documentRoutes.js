const express = require('express');
const router = express.Router();
const { 
  uploadDocument, 
  getPlayerDocuments, 
  downloadDocument, 
  deleteDocument, 
  upload 
} = require('../controllers/documentController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleGuard');
const loggerMiddleware = require('../middleware/loggerMiddleware');

/**
 * Document Routes
 * 
 * All routes require authentication
 * All routes require manager or admin role
 * 
 * Validates Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

// POST /api/documents - Upload document for a player (manager, admin)
router.post('/', 
  authMiddleware, 
  requireRole(['manager', 'admin']), 
  upload.single('document'), 
  uploadDocument
);

// GET /api/documents/:playerId - Get all documents for a player (manager, admin)
router.get('/:playerId', 
  authMiddleware, 
  requireRole(['manager', 'admin']), 
  getPlayerDocuments
);

// GET /api/documents/download/:documentId - Download a document (manager, admin)
router.get('/download/:documentId', 
  authMiddleware, 
  requireRole(['manager', 'admin']), 
  downloadDocument
);

// DELETE /api/documents/:documentId - Delete a document (manager, admin)
router.delete('/:documentId', 
  authMiddleware, 
  requireRole(['manager', 'admin']), 
  loggerMiddleware, 
  deleteDocument
);

module.exports = router;
