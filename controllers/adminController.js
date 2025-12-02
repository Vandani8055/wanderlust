const User = require('./../models/userModel');
const Listing = require('./../models/listingModel');
const Review = require('./../models/reviewModel');
const Booking = require('./../models/bookingModel');


// ================================
// ADMIN DASHBOARD
// ================================

module.exports.adminDashboard = async (req, res) => {
  try {
   const users = await User.find({
  role: { $in: ["user", "host"] }
});

   const listings = await Listing.find({});

    const reviews = await Review.find({});
    const bookings = await Booking.find({});

    // Optional: totals for cards
    const totalUsers = users.length;
    const totalListings = listings.length;
    const totalReviews = reviews.length;
    const totalBookings = bookings.length;
    const monthlyRevenue = 12450; // or calculate dynamically

    res.render("dashboards/adminDashboard", {
      admin: req.user || null,
      totalUsers,
      totalListings,
      totalReviews,
      totalBookings,
      monthlyRevenue,
      users,       // ✅ pass full users array
      listings,    // ✅ pass full listings array
      reviews,     // ✅ pass full reviews array
      bookings     // ✅ pass full bookings array
    });
  } catch (err) {
    console.log(err);
    res.send("Error loading admin dashboard");
  }
};





// ================================
// EDIT ADMIN PROFILE
// ================================

module.exports.renderEditProfileAdmin = (req, res) => {
  const admin = req.user;   
  res.render("dashboards/editAdmindashboard", { admin });
};


module.exports.updateProfileAdmin = async (req, res) => {
  try {
    const { username, bio } = req.body;
    const updateData = { username, bio };

    // If user uploaded a new image, save its Cloudinary URL
    if (req.file) {
      updateData.profileImage = req.file.path; // multer-storage-cloudinary automatically gives URL in path
    }

    await User.findByIdAndUpdate(req.user._id, updateData);

    req.flash("success", "Profile updated successfully!");
    res.redirect("/admin/dashboard");
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/user/edit");
  }
};





// ================================
// ADMIN CRUD — USERS
// ================================


module.exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    req.flash("success", "User deleted successfully!");
    res.redirect("/admin/dashboard");
  } catch (err) {
    req.flash("error", "Failed to delete user.");
    res.redirect("/admin/dashboard");
  }
};




// ================================
// ADMIN CRUD — LISTINGS
// ================================

module.exports.deleteListing = async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);
  res.redirect("/admin/dashboard");
};


// ================================
// ADMIN CRUD — REVIEWS
// ================================

module.exports.deleteReview = async (req, res) => {
  await Review.findByIdAndDelete(req.params.id);
  res.redirect("/admin/dashboard");
};



// ================================
// ADMIN CRUD — BOOKINGS
// ================================
module.exports.deleteBooking = async (req, res) => {
  await Booking.findByIdAndDelete(req.params.id);
  res.redirect("/admin/dashboard");
};
