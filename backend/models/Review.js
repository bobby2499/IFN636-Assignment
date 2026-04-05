const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  attraction: { type: mongoose.Schema.Types.ObjectId, ref: 'Attraction', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true, trim: true },
  body: { type: String, required: true },
  status: { type: String, enum: ['active', 'flagged', 'removed'], default: 'active' }
}, { timestamps: true });

// one review per user per attraction
reviewSchema.index({ attraction: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
