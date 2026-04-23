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
  let generatedOptimizedPath = null;

  console.log('🚀 Logo upload request received');
  console.log('📦 Request file:', req.file ? {
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    path: req.file.path,
    filename: req.file.filename
  } : 'No file');

  try {
    if (!req.file) {
      console.error('❌ No file uploaded in request');
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const filePath = req.file.path;
    const uploadedFileName = req.file.filename;
    const optimizedFileName = `logo-${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;
    const logoDirectory = getLogoUploadDir();
    generatedOptimizedPath = path.join(logoDirectory, optimizedFileName);

    console.log('📁 Logo directory:', logoDirectory);
    console.log('🎯 Optimized file path:', generatedOptimizedPath);

    let finalLogoPath = filePath;
    let finalLogoFileName = uploadedFileName;

    await fs.mkdir(logoDirectory, { recursive: true });
    console.log('✅ Logo directory created/verified');

    try {
      // Prefer optimized webp, but keep original upload if optimization fails.
      console.log('🔧 Starting image optimization with Sharp...');
      await sharp(filePath)
        .rotate()
        .resize(1920, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({ quality: 86 })
        .toFile(generatedOptimizedPath);

      console.log('✅ Image optimization successful');
      await fs.unlink(filePath);
      finalLogoPath = generatedOptimizedPath;
      finalLogoFileName = optimizedFileName;
    } catch (optimizationError) {
      console.warn('⚠️ Logo optimization failed, keeping original upload:', optimizationError.message);
      finalLogoPath = filePath;
      finalLogoFileName = uploadedFileName;
      generatedOptimizedPath = null;
    }

    // Generate URL for the optimized file
    const logoUrl = `/uploads/logos/${finalLogoFileName}`;
    console.log('🔗 Generated logo URL:', logoUrl);

    // Update settings with new logo URL
    console.log('📝 Fetching settings...');
    const settings = await Settings.getSingleton();
    console.log('✅ Settings retrieved');

    // Delete old logo file if exists
    if (settings.logoUrl) {
      console.log('🗑️ Deleting old logo:', settings.logoUrl);
      const oldRelativePath = settings.logoUrl.replace(/^\/uploads\//, '');
      const oldLogoPath = path.join(getUploadRoot(), oldRelativePath);

      try {
        if (oldLogoPath !== finalLogoPath) {
          await fs.unlink(oldLogoPath);
          console.log('✅ Old logo deleted');
        }
      } catch (error) {
        // Ignore if file doesn't exist
        console.log('ℹ️ Old logo file not found or already deleted:', error.message);
      }
    }

    settings.logoUrl = logoUrl;
    settings.updatedBy = req.user.id;

    // Filter out empty trophy entries to prevent validation errors during logo upload
    if (settings.trophies && settings.trophies.length > 0) {
      settings.trophies = settings.trophies.filter(trophy =>
        trophy.competitionName && trophy.competitionName.trim() !== '' &&
        trophy.year && trophy.year.trim() !== ''
      );
    }

    await settings.save();
    console.log('✅ Settings updated with new logo URL');

    // Emit Socket.io event
    const { getIO } = require('../utils/socketIO');
    const io = getIO();
    io.emit('settings:updated', {
      clubName: settings.clubName,
      logoUrl: settings.logoUrl
    });
    console.log('📡 Socket.io event emitted');

    res.status(200).json({
      success: true,
      message: 'Logo uploaded and optimized successfully',
      logoUrl: logoUrl
    });
    console.log('✅ Logo upload completed successfully');
  } catch (error) {
    console.error('❌ Upload logo error:', error);
    console.error('❌ Error stack:', error.stack);
    
    // Clean up uploaded files on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
        console.log('🗑️ Cleaned up uploaded file');
      } catch (unlinkError) {
        console.error('❌ Error deleting failed upload:', unlinkError);
      }
    }

    if (generatedOptimizedPath) {
      try {
        await fs.unlink(generatedOptimizedPath);
        console.log('🗑️ Cleaned up optimized file');
      } catch (optimizedCleanupError) {
        // Best-effort cleanup only.
        console.error('❌ Error cleaning up optimized file:', optimizedCleanupError);
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
