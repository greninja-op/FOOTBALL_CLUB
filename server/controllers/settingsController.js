const Settings = require('../models/Settings');

/**
 * Settings Controller
 * Handles club settings management
 * 
 * Validates Requirements: 4.1, 4.2, 4.5
 */

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
    
    // Update fields if provided
    if (clubName !== undefined) {
      settings.clubName = clubName;
    }
    if (logoUrl !== undefined) {
      settings.logoUrl = logoUrl;
    }
    
    settings.updatedBy = req.user.id;
    
    await settings.save();
    
    // Emit Socket.io event for real-time updates
    const { io } = require('../server');
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

module.exports = {
  getSettings,
  updateSettings
};
