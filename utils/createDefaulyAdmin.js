const User = require('../models/userModel');

async function createDefaultAdmin() {
  try {
    const adminExist = await User.findOne({ role: 'admin' });
    if (adminExist) return console.log('Admin already exists');

    const defaultAdmin = new User({
      username: "Admin",
      email: "admin@wanderlust.com",
      role: "admin",
    });

    await User.register(defaultAdmin, 'adminwithstrongpassword');

    console.log('Default admin created: email=admin@wanderlust.com, password=adminwithstrongpassword');
  } catch (err) {
    console.log('Error creating default admin:', err);
  }
}

module.exports = createDefaultAdmin;
