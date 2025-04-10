const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['general', 'pricing', 'notifications', 'appearance'],
    unique: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, {
  timestamps: true
});

const Setting = mongoose.model('Setting', settingSchema);

module.exports = Setting;