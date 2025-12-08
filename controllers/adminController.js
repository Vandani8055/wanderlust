const User = require('./../models/userModel');
const Listing = require('./../models/listingModel');
const Review = require('./../models/reviewModel');
const Booking = require('./../models/bookingModel');


// --- Admin dashboard ---

module.exports.adminDashboard = async (req, res) => {
  try {
    const users = await User.find({
      role: { $in: ["user"] }
    });

    const listings = await Listing.find({});

    // FIX: populate listing + filter deleted listing reviews
    const allReviews = await Review.find({}).populate("listing");
    const reviews = allReviews.filter(r => r.listing !== null);

    // Bookings : not deleted listing booking not show:
    const allBookings = await Booking.find({}).populate("listing");
    const bookings = allBookings.filter(b => b.listing !== null);

    const totalUsers = users.length;
    const totalListings = listings.length;
    const totalReviews = reviews.length;   // FIXED COUNT
    const totalBookings = bookings.length;
    const monthlyRevenue = 12450;

    res.render("dashboards/admindashboard", {
      admin: req.user || null,
      totalUsers,
      totalListings,
      totalReviews,
      totalBookings,
      monthlyRevenue,
      users,
      listings,
      reviews,     // now filtered
      bookings
    });

  } catch (err) {
    console.log(err);
    res.send("Error loading admin dashboard");
  }
};


// --- Edit admin profile ---

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
    res.redirect("/admin/edit");
  }
};


// --- Admin users delete (usercontroller not have permittion it itself delete just logout ) ---

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


// --- Admin bookings delete ---

module.exports.deleteBooking = async (req, res) => {
  await Booking.findByIdAndDelete(req.params.id);
  res.redirect("/admin/dashboard");
};
