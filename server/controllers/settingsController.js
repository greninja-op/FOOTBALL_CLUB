const Settings = require('../models/Settings');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const { sanitizeText } = require('../utils/sanitize');

const getUploadRoot = () => path.resolve(process.env.UPLOAD_DIR || './uploads');
const getLogoUploadDir = () => path.join(getUploadRoot(), 'logos');

const sanitizeOptionalText = (value) => {
  if (value === undefined || value === null) {
    return value;
  }

  return sanitizeText(String(value));
};

const normalizeTrophies = (trophies) => {
  if (!Array.isArray(trophies)) {
    return undefined;
  }

  return trophies
    .map((entry) => ({
      competitionName: sanitizeOptionalText(entry?.competitionName || entry?.title || ''),
      seasonIdentifier: sanitizeOptionalText(entry?.seasonIdentifier || ''),
      trophyAsset: sanitizeOptionalText(entry?.trophyAsset || ''),
      year: sanitizeOptionalText(entry?.year || ''),
      manager: sanitizeOptionalText(entry?.manager || ''),
      captain: sanitizeOptionalText(entry?.captain || ''),
      finalResult: sanitizeOptionalText(entry?.finalResult || ''),
      playersInvolved: Array.isArray(entry?.playersInvolved)
        ? entry.playersInvolved
            .map((player) => ({
              name: sanitizeOptionalText(player?.name || ''),
              avatarUrl: sanitizeOptionalText(player?.avatarUrl || '')
            }))
            .filter((player) => player.name)
        : [],
      reportUrl: sanitizeOptionalText(entry?.reportUrl || '')
    }))
    .filter((entry) => entry.competitionName && entry.year)
    .slice(0, 8);
};

const serializeSettings = (settings) => ({
  clubName: settings.clubName,
  logoUrl: settings.logoUrl,
  homepageHeadline: settings.homepageHeadline,
  clubDescription: settings.clubDescription,
  founded: settings.founded,
  ground: settings.ground,
  league: settings.league,
  contactEmail: settings.contactEmail,
  socialHandle: settings.socialHandle,
  trophies: settings.trophies || []
});

/**
 * Settings Controller
 * Handles club settings management with file upload and image optimization
 * 
 * Validates Requirements: 4.1, 4.2, 4.4, 4.5, 24.5
 */

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = getLogoUploadDir();
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname).toLowerCase());
  }
});

const fileFilter = (req, file, cb) => {
  // Accept common web image formats used by modern browsers.
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'), false);
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
      settings: serializeSettings(settings)
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
    const {
      clubName,
      logoUrl,
      homepageHeadline,
      clubDescription,
      founded,
      ground,
      league,
      contactEmail,
      socialHandle,
      trophies
    } = req.body;
    
    // Get singleton settings document
    const settings = await Settings.getSingleton();
    
    // Update fields if provided (sanitize clubName to prevent XSS - Requirement 21.5)
    if (clubName !== undefined) {
      settings.clubName = sanitizeText(clubName);
    }
    if (logoUrl !== undefined) {
      settings.logoUrl = logoUrl;
    }
    if (homepageHeadline !== undefined) {
      settings.homepageHeadline = sanitizeOptionalText(homepageHeadline);
    }
    if (clubDescription !== undefined) {
      settings.clubDescription = sanitizeOptionalText(clubDescription);
    }
    if (founded !== undefined) {
      settings.founded = founded;
    }
    if (ground !== undefined) {
      settings.ground = sanitizeOptionalText(ground);
    }
    if (league !== undefined) {
      settings.league = sanitizeOptionalText(league);
    }
    if (contactEmail !== undefined) {
      settings.contactEmail = sanitizeOptionalText(contactEmail);
    }
    if (socialHandle !== undefined) {
      settings.socialHandle = sanitizeOptionalText(socialHandle);
    }

    const normalizedTrophies = normalizeTrophies(trophies);
    if (normalizedTrophies !== undefined) {
      settings.trophies = normalizedTrophies;
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
      settings: serializeSettings(settings)
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
  let optimizedPath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const filePath = req.file.path;
    const optimizedFileName = `logo-${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;
    const logoDirectory = getLogoUploadDir();
    optimizedPath = path.join(logoDirectory, optimizedFileName);
    await fs.mkdir(logoDirectory, { recursive: true });

    // Always convert to webp to avoid extension/format mismatch issues.
    await sharp(filePath)
      .rotate()
      .resize(1920, null, { // Max width 1920px, maintain aspect ratio
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: 86 })
      .toFile(optimizedPath);

    // Delete original file
    await fs.unlink(filePath);

    // Generate URL for the optimized file
    const logoUrl = `/uploads/logos/${optimizedFileName}`;

    // Update settings with new logo URL
    const settings = await Settings.getSingleton();
    
    // Delete old logo file if exists
    if (settings.logoUrl) {
      const oldRelativePath = settings.logoUrl.replace(/^\/uploads\//, '');
      const oldLogoPath = path.join(getUploadRoot(), oldRelativePath);

      try {
        if (oldLogoPath !== optimizedPath) {
          await fs.unlink(oldLogoPath);
        }
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
    
    // Clean up uploaded files on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting failed upload:', unlinkError);
      }
    }

    if (optimizedPath) {
      try {
        await fs.unlink(optimizedPath);
      } catch (optimizedCleanupError) {
        // Best-effort cleanup only.
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
