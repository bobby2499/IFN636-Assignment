const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Attraction = require('../models/Attraction');
const { protect } = require('../middleware/authMiddleware');

// helper to recalculate average rating
const updateAttractionRating = async (attractionId) => {
  const reviews = await Review.find({ attraction: attractionId, status: 'active' });
  const count = reviews.length;
  const avg = count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;
  await Attraction.findByIdAndUpdate(attractionId, {
    avgRating: Math.round(avg * 10) / 10,
    reviewCount: count
  });
};

// GET /api/reviews/attraction/:id - get reviews for an attraction (public)
router.get('/attraction/:id', async (req, res) => {
  try {
    const { sort } = req.query;
    let sortOption = { createdAt: -1 };
    if (sort === 'highest') sortOption = { rating: -1 };
    if (sort === 'lowest') sortOption = { rating: 1 };

    const reviews = await Review.find({
      attraction: req.params.id,
      status: 'active'
    })
      .populate('user', 'name')
      .sort(sortOption);

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/reviews/my - get current user's reviews
router.get('/my', protect, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('attraction', 'name location')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/reviews - create a review
router.post('/', protect, async (req, res) => {
  try {
    const { attraction, rating, title, body } = req.body;

    // check if user already reviewed this attraction
    const existing = await Review.findOne({ attraction, user: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this attraction' });
    }

    const review = await Review.create({
      attraction,
      user: req.user._id,
      rating,
      title,
      body
    });

    await updateAttractionRating(attraction);

    const populated = await Review.findById(review._id).populate('user', 'name');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/reviews/:id - update own review
router.put('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own reviews' });
    }

    review.rating = req.body.rating || review.rating;
    review.title = req.body.title || review.title;
    review.body = req.body.body || review.body;

    const updated = await review.save();
    await updateAttractionRating(review.attraction);

    const populated = await Review.findById(updated._id).populate('user', 'name');
    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/reviews/:id - delete own review
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    // allow owner or admin to delete
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorised to delete this review' });
    }

    const attractionId = review.attraction;
    await Review.findByIdAndDelete(req.params.id);
    await updateAttractionRating(attractionId);

    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
