const mongoose = require('mongoose');

/**
 * Document Schema
 * Represents player documents stored in the document vault
 * 
 * Validates Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */
const DocumentSchema = new mongoose.Schema({
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: [true, 'Player ID is required']
  },
  fileName: {
    type: String,
    required: [true, 'File name is required'],
    trim: true
  },
  originalName: {
    type: String,
    required: [true, 'Original file name is required'],
    trim: true
  },
  filePath: {
    type: String,
    required: [true, 'File path is required']
  },
  fileType: {
    type: String,
    required: [true, 'File type is required'],
    enum: {
      values: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
      message: '{VALUE} is not a valid file type. Must be PDF, JPEG, or PNG'
    }
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required'],
    max: [10 * 1024 * 1024, 'File size cannot exceed 10MB']
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader ID is required']
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
    immutable: true
  }
});

// Indexes for performance optimization
DocumentSchema.index({ playerId: 1 });
DocumentSchema.index({ uploadedBy: 1 });
DocumentSchema.index({ uploadedAt: -1 });

const Document = mongoose.model('Document', DocumentSchema);

module.exports = Document;
