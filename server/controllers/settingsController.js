const Settings = require('../models/Settings');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const { sanitizeText } = require('../utils/sanitize');

/**
 * Settings Controller
 * Handles club settings management with file upload and image optimization
 * 
 * Validates Requirements: 4.1, 4.2, 4.4, 4.5, 24.5
 */

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only JPEG and PNG
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  }
});

/**
 * Get club settings
 * GET /api/settings
 * 
 * @access All authenticated users
 */
const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSingleton();
    
    res.status(200).json({
      success: true,
      settings: {
        clubName: settings.clubName,
        logoUrl: settings.logoUrl
      }
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: error.message
    });
  }
};

/**
 * Update club settings
 * PUT /api/settings
 * 
 * @access Admin only
 */
const updateSettings = async (req, res) => {
  try {
    const { clubName, logoUrl } = req.body;
    
    // Get singleton settings document
    const settings = await Settings.getSingleton();
    
    // Update fields if provided (sanitize clubName to prevent XSS - Requirement 21.5)
    if (clubName !== undefined) {
      settings.clubName = sanitizeText(clubName);
    }
    if (logoUrl !== undefined) {
      settings.logoUrl = logoUrl;
    }
    
    settings.updatedBy = req.user.id;
    
    await settings.save();
    
    // Emit Socket.io event for real-time updates
    const { getIO } = require('../utils/socketIO');
    const io = getIO();
    io.emit('settings:updated', {
      clubName: settings.clubName,
      logoUrl: settings.logoUrl
    });
    
    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      settings: {
        clubName: settings.clubName,
        logoUrl: settings.logoUrl
      }
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update settings',
      error: error.message
    });
  }
};

/**
 * Upload and optimize club logo
 * POST /api/settings/logo
 * 
 * @access Admin only
 */
const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const filePath = req.file.path;
    const optimizedPath = filePath.replace(path.extname(filePath), '-optimized' + path.extname(filePath));

    // Optimize image using sharp
    await sharp(filePath)
      .resize(1920, null, { // Max width 1920px, maintain aspect ratio
        withoutEnlargement: true,
        fit: 'inside'
      })
      .jpeg({ quality: 85 })
      .png({ quality: 85, compressionLevel: 9 })
      .toFile(optimizedPath);

    // Delete original file
    await fs.unlink(filePath);

    // Generate URL for the optimized file
    const logoUrl = `/uploads/${path.basename(optimizedPath)}`;

    // Update settings with new logo URL
    const settings = await Settings.getSingleton();
    
    // Delete old logo file if exists
    if (settings.logoUrl) {
      const oldLogoPath = path.join(process.env.UPLOAD_DIR || './uploads', path.basename(settings.logoUrl));
      try {
        await fs.unlink(oldLogoPath);
      } catch (error) {
        // Ignore if file doesn't exist
        console.log('Old logo file not found or already deleted');
      }
    }

    settings.logoUrl = logoUrl;
    settings.updatedBy = req.user.id;
    await settings.save();

    // Emit Socket.io event
    const { getIO } = require('../utils/socketIO');
    const io = getIO();
    io.emit('settings:updated', {
      clubName: settings.clubName,
      logoUrl: settings.logoUrl
    });

    res.status(200).json({
      success: true,
      message: 'Logo uploaded and optimized successfully',
      logoUrl: logoUrl
    });
  } catch (error) {
    console.error('Upload logo error:', error);
    
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
      message: 'Failed to upload logo',
      error: error.message
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  uploadLogo,
  upload // Export multer middleware
};
