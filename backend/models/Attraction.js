const mongoose = require('mongoose');

const attractionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  category: { type: String, required: true },
  images: [{ type: String }],
  openingHours: { type: String, default: '' },
  entryPrice: { type: Number, default: 0 },
  avgRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Attraction', attractionSchema);
