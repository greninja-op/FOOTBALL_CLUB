const Document = require('../models/Document');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

/**
 * Document Controller
 * Handles player document management with file upload, validation, and storage
 * 
 * Validates Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

// Configure multer for document uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = process.env.DOCUMENTS_DIR || './uploads/documents';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, 'doc-' + uniqueSuffix + '-' + sanitizedName);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only PDF, JPEG, and PNG
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPEG, and PNG are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

/**
 * Upload document for a player
 * POST /api/documents
 * 
 * @access Manager, Admin
 */
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { playerId } = req.body;

    if (!playerId) {
      // Clean up uploaded file
      await fs.unlink(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Player ID is required'
      });
    }

    // Create document record
    const document = await Document.create({
      playerId: playerId,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      document: {
        id: document._id,
        playerId: document.playerId,
        originalName: document.originalName,
        fileType: document.fileType,
        fileSize: document.fileSize,
        uploadedAt: document.uploadedAt
      }
    });
  } catch (error) {
    console.error('Upload document error:', error);

    // Clean up uploaded file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting failed upload:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error.message
    });
  }
};

/**
 * Get all documents for a player
 * GET /api/documents/:playerId
 * 
 * @access Manager, Admin
 */
const getPlayerDocuments = async (req, res) => {
  try {
    const { playerId } = req.params;

    const documents = await Document.find({ playerId })
      .populate('uploadedBy', 'email role')
      .sort({ uploadedAt: -1 });

    res.status(200).json({
      success: true,
      count: documents.length,
      documents: documents.map(doc => ({
        id: doc._id,
        playerId: doc.playerId,
        originalName: doc.originalName,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        uploadedBy: doc.uploadedBy,
        uploadedAt: doc.uploadedAt
      }))
    });
  } catch (error) {
    console.error('Get player documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
      error: error.message
    });
  }
};

/**
 * Download a document
 * GET /api/documents/download/:documentId
 * 
 * @access Manager, Admin
 */
const downloadDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check if file exists
    try {
      await fs.access(document.filePath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Set headers for file download
    res.setHeader('Content-Type', document.fileType);
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);

    // Stream file to response
    const fileStream = require('fs').createReadStream(document.filePath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      console.error('File stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error streaming file',
          error: error.message
        });
      }
    });
  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download document',
      error: error.message
    });
  }
};

/**
 * Delete a document
 * DELETE /api/documents/:documentId
 * 
 * @access Manager, Admin
 */
const deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete file from filesystem
    try {
      await fs.unlink(document.filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
      // Continue with database deletion even if file deletion fails
    }

    // Delete document record from database
    await Document.findByIdAndDelete(documentId);

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error.message
    });
  }
};

module.exports = {
  uploadDocument,
  getPlayerDocuments,
  downloadDocument,
  deleteDocument,
  upload // Export multer middleware
};
