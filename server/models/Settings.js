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
  homepageHeadline: {
    type: String,
    trim: true,
    default: 'Season in Motion'
  },
  clubDescription: {
    type: String,
    trim: true,
    default: 'A modern football club built on discipline, identity, and long-term player development.'
  },
  founded: {
    type: Number,
    default: 1987
  },
  ground: {
    type: String,
    trim: true,
    default: 'Club Stadium'
  },
  league: {
    type: String,
    trim: true,
    default: 'Premier Division'
  },
  contactEmail: {
    type: String,
    trim: true,
    default: 'hello@club.com'
  },
  socialHandle: {
    type: String,
    trim: true,
    default: '@clubofficial'
  },
  trophies: {
    type: [
      {
        competitionName: { type: String, required: true },
        seasonIdentifier: { type: String },
        trophyAsset: { type: String },
        year: { type: String, required: true },
        manager: { type: String },
        captain: { type: String },
        finalResult: { type: String },
        playersInvolved: [
          {
            name: { type: String },
            avatarUrl: { type: String }
          }
        ],
        reportUrl: { type: String }
      }
    ],
    default: [
      {
        competitionName: 'PREMIER LEAGUE CHAMPIONS',
        seasonIdentifier: 'SEASON 2025/26',
        year: '2026',
        manager: 'J. Guardiola',
        captain: 'Kevin De Bruyne',
        finalResult: '3-1 vs Man City',
        playersInvolved: [
          { name: 'Haaland', avatarUrl: '' },
          { name: 'Foden', avatarUrl: '' },
          { name: 'Bernardo', avatarUrl: '' }
        ],
        reportUrl: '/reports/2026-pl'
      }
    ]
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
