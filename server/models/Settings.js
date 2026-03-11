const mongoose = require('mongoose');

/**
 * Settings Schema
 * Represents club-wide settings with singleton pattern to ensure only one settings document exists
 * 
 * Validates Requirements: 4.1, 4.5, 22.1
 */
const SettingsSchema = new mongoose.Schema({
  clubName: {
    type: String,
    required: [true, 'Club name is required'],
    trim: true,
    minlength: [3, 'Club name must be at least 3 characters'],
    maxlength: [100, 'Club name cannot exceed 100 characters']
  },
  logoUrl: {
    type: String,
    default: null
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

/**
 * Static method to get or create the singleton settings document
 * Ensures only one settings document exists in the database
 * 
 * @returns {Promise<Document>} The settings document
 */
SettingsSchema.statics.getSingleton = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({ clubName: 'Football Club' });
  }
  return settings;
};

// Update the updatedAt timestamp on every save
SettingsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Settings = mongoose.model('Settings', SettingsSchema);

module.exports = Settings;
