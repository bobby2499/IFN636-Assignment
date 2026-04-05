const Attraction = require('../models/Attraction');
const Review = require('../models/Review');

// Create attraction
const createAttraction = async (req, res) => {
    try {
        const attraction = await Attraction.create({
            ...req.body,
            createdBy: req.user.id
        });
        res.status(201).json(attraction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all attractions
const getAttractions = async (req, res) => {
    try {
        const attractions = await Attraction.find();
        res.status(200).json(attractions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single attraction
const getAttraction = async (req, res) => {
    try {
        const attraction = await Attraction.findById(req.params.id);
        if (!attraction) {
            return res.status(404).json({ message: 'Attraction not found' });
        }
        res.status(200).json(attraction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update attraction
const updateAttraction = async (req, res) => {
    try {
        const attraction = await Attraction.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!attraction) {
            return res.status(404).json({ message: 'Attraction not found' });
        }
        res.status(200).json(attraction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete attraction
const deleteAttraction = async (req, res) => {
    try {
        const attraction = await Attraction.findByIdAndDelete(req.params.id);
        if (!attraction) {
            return res.status(404).json({ message: 'Attraction not found' });
        }
        await Review.deleteMany({ attraction: req.params.id });
        res.status(200).json({ message: 'Attraction and its reviews deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createAttraction, getAttractions, getAttraction, updateAttraction, deleteAttraction };
