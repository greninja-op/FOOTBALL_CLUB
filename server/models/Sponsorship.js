const mongoose = require('mongoose');

const SponsorshipSchema = new mongoose.Schema({
  brandName: {
    type: String,
    required: [true, 'Brand name is required'],
    trim: true,
    maxlength: [120, 'Brand name cannot exceed 120 characters']
  },
  type: {
    type: String,
    required: [true, 'Sponsorship type is required'],
    enum: {
      values: ['Shirt', 'Sleeve', 'Stadium', 'Training Wear', 'Kit'],
      message: '{VALUE} is not a valid sponsorship type'
    }
  },
  annualValue: {
    type: Number,
    required: [true, 'Annual value is required'],
    min: [0, 'Annual value cannot be negative']
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

SponsorshipSchema.index({ expiryDate: 1 });
SponsorshipSchema.index({ type: 1 });

SponsorshipSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Sponsorship', SponsorshipSchema);
