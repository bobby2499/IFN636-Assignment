const express = require('express');
const router = express.Router();
const Attraction = require('../models/Attraction');
const Review = require('../models/Review');
const { protect } = require('../middleware/authMiddleware');

// GET /api/attractions - list all (public)
router.get('/', async (req, res) => {
  try {
    const { category, location, search, sort } = req.query;
    let query = {};

    if (category) query.category = category;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'rating') sortOption = { avgRating: -1 };
    if (sort === 'name') sortOption = { name: 1 };

    const attractions = await Attraction.find(query).sort(sortOption);
    res.json(attractions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/attractions/:id - get single (public)
router.get('/:id', async (req, res) => {
  try {
    const attraction = await Attraction.findById(req.params.id);
    if (!attraction) return res.status(404).json({ message: 'Attraction not found' });
    res.json(attraction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/attractions - create (admin only)
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const attraction = await Attraction.create({
      ...req.body,
      createdBy: req.user._id
    });
    res.status(201).json(attraction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/attractions/:id - update (admin only)
router.put('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const attraction = await Attraction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!attraction) return res.status(404).json({ message: 'Attraction not found' });
    res.json(attraction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/attractions/:id - delete (admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const attraction = await Attraction.findByIdAndDelete(req.params.id);
    if (!attraction) return res.status(404).json({ message: 'Attraction not found' });

    // also delete all reviews for this attraction
    await Review.deleteMany({ attraction: req.params.id });

    res.json({ message: 'Attraction and its reviews deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
