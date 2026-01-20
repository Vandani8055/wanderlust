// Environment Variables Configuration
if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const mongoose = require("mongoose");
const User = require('../models/userModel');

// Database Connection
const mongoURL = process.env.ATLAS_DB_URL;

async function createDefaultAdmin() {
  try {
    // Connect to database first
    await mongoose.connect(mongoURL);
    console.log('Connected to DB successfully!');

    const adminExist = await User.findOne({ role: 'admin' });
    if (adminExist) {
      console.log('Admin already exists');
      await mongoose.connection.close();
      return;
    }

    const defaultAdmin = new User({
      username: "Admin",
      email: "admin@wanderlust.com",
      role: "admin",
    });

    await User.register(defaultAdmin, 'adminwithstrongpassword');

    console.log('Default admin created: email=admin@wanderlust.com, password=adminwithstrongpassword');
  } catch (err) {
    console.log('Error creating default admin:', err);
  } finally {
    await mongoose.connection.close();
  }
}

module.exports = createDefaultAdmin;
