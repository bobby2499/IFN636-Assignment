const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Attraction = require('../models/Attraction');
const Review = require('../models/Review');
const { protect } = require('../middleware/authMiddleware');

// middleware to check admin
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

// GET /api/admin/dashboard
router.get('/dashboard', protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAttractions = await Attraction.countDocuments();
    const totalReviews = await Review.countDocuments();
    const flaggedReviews = await Review.countDocuments({ status: 'flagged' });

    res.json({ totalUsers, totalAttractions, totalReviews, flaggedReviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/users - list all users
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin/users/:id/status - suspend or activate user
router.put('/users/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.status = req.body.status;
    await user.save();
    res.json({ message: `User ${req.body.status}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/admin/users/:id - delete user
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Review.deleteMany({ user: req.params.id });
    res.json({ message: 'User and their reviews deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/reviews - list all reviews (with filter)
router.get('/reviews', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status;

    const reviews = await Review.find(query)
      .populate('user', 'name email')
      .populate('attraction', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin/reviews/:id/status - approve or flag review
router.put('/reviews/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    review.status = req.body.status;
    await review.save();
    res.json({ message: `Review ${req.body.status}`, review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
