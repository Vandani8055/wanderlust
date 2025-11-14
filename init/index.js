// -----------------------------------------------------------------------------
// IMPORTS & DEPENDENCIES
// -----------------------------------------------------------------------------
const mongoose = require('mongoose');
const initData = require('./data.js');
const Listing = require('../models/listing.js');


// -----------------------------------------------------------------------------
// DATABASE CONNECTION SETUP
// -----------------------------------------------------------------------------

// 💡 FIX: The database name ('wanderlust') MUST be specified in the MONGO_URL
// The connection string is structured as: mongodb+srv://<username>:<password>@<cluster-url>/<databaseName>
// I am assuming the database you want to use is 'wanderlust', based on your Compass screenshot.
const mongoURL = process.env.ATLAS_DB_URL;


async function main() {
  // Pass the URL with the correct database name
  await mongoose.connect(mongoURL);
}



main()
  .then(() => {
    console.log('Connected to DB successfully!');
  })
  .catch((err) => {
    // Check console for specific error details if connection fails
    console.error('Database connection error:', err);
  });


// -----------------------------------------------------------------------------
// INITIALIZE DATABASE WITH SAMPLE DATA
// -----------------------------------------------------------------------------

// DELETE AND INSERT SAMPLE DATA TO DB:
const initDB = async () => {
  try {
    // 1. Delete all existing documents
    await Listing.deleteMany({}); 

    initData.data = initData.data.map((obj) => ({...obj, owner : "69139c59834d926bccbfa8f8"}));

    // 2. Insert the sample data
    // Assuming initData.data is an array of Listing objects
    await Listing.insertMany(initData.data); 
    
    console.log("Data was initialized successfully and should now be visible in the 'wanderlust' database!");
  } catch (error) {
    console.error("Error initializing data:", error);
  }
};

// Call the initialization function after connecting to the DB
// initDB();    //only run one when database is empty:



