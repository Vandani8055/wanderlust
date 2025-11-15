// -----------------------------------------------------------------------------
// IMPORTS & DEPENDENCIES
// -----------------------------------------------------------------------------
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const Listing = require('../models/listing.js');
const User = require('../models/user.js');
const initData = require('./data.js');

// -----------------------------------------------------------------------------
// DATABASE CONNECTION SETUP
// -----------------------------------------------------------------------------
const mongoURL = process.env.ATLAS_DB_URL;
if (!mongoURL) throw new Error('ATLAS_DB_URL is not defined in .env!');

mongoose.connect(mongoURL)
  .then(() => console.log('✅ Connected to DB successfully!'))
  .catch(err => console.error('❌ Database connection error:', err));

// -----------------------------------------------------------------------------
// INITIALIZE DATABASE WITH SAMPLE DATA
// -----------------------------------------------------------------------------
const initDB = async () => {
  try {
    await Listing.deleteMany({}); // clear listings
    const user = await User.findOne(); // get any existing user
    if (!user) throw new Error('No users found! Create a user first.');

    const listingsSeed = initData.data.map(obj => ({ ...obj, owner: user._id }));
    await Listing.insertMany(listingsSeed);

    console.log(`📌 Inserted ${listingsSeed.length} listings. Database initialization complete!`);
  } catch (err) {
    console.error('❌ Error initializing data:', err);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Database connection closed.');
  }
};

// Call the initialization function
// initDB();
// 