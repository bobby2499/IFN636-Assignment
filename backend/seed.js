// Run this once to set up initial data:
// cd backend && node seed.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Attraction = require('./models/Attraction');

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Create admin user
    const adminExists = await User.findOne({ email: 'admin@travelreview.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@travelreview.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('Admin user created (admin@travelreview.com / admin123)');
    } else {
      console.log('Admin user already exists');
    }

    // Create sample attractions
    const count = await Attraction.countDocuments();
    if (count === 0) {
      await Attraction.insertMany([
        {
          name: 'Great Barrier Reef',
          description: 'The worlds largest coral reef system, stretching over 2,300km along the northeast coast of Australia. Home to incredible marine life including 1,500 species of fish and 400 types of coral.',
          location: 'Queensland, Australia',
          category: 'Nature',
          openingHours: '6:00 AM - 6:00 PM',
          entryPrice: 85
        },
        {
          name: 'Sydney Opera House',
          description: 'One of the most famous buildings in the world, this iconic performing arts centre sits on Sydney Harbour and hosts over 1,500 performances each year.',
          location: 'Sydney, Australia',
          category: 'Cultural',
          openingHours: '9:00 AM - 5:00 PM',
          entryPrice: 43
        },
        {
          name: 'Uluru (Ayers Rock)',
          description: 'A massive sandstone monolith in the heart of the Australian outback. Sacred to the Anangu Aboriginal people and a UNESCO World Heritage Site.',
          location: 'Northern Territory, Australia',
          category: 'Historical',
          openingHours: '5:00 AM - 7:30 PM',
          entryPrice: 38
        },
        {
          name: 'Blue Mountains',
          description: 'A mountainous region west of Sydney known for dramatic scenery, eucalyptus forests, waterfalls, and the iconic Three Sisters rock formation.',
          location: 'New South Wales, Australia',
          category: 'Adventure',
          openingHours: 'Open 24 hours',
          entryPrice: 0
        },
        {
          name: 'Queen Victoria Market',
          description: 'Melbournes most famous market, operating since 1878. Offers fresh food, clothing, souvenirs, and street food from around the world.',
          location: 'Melbourne, Australia',
          category: 'Food & Drink',
          openingHours: '6:00 AM - 3:00 PM',
          entryPrice: 0
        }
      ]);
      console.log('Sample attractions created');
    } else {
      console.log('Attractions already exist, skipping seed');
    }

    console.log('Seed complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seed();
