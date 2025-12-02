const User = require("./../models/userModel");
const Listing = require("./../models/listingModel");
const Review = require("./../models/reviewModel");
const Booking = require("./../models/bookingModel");

module.exports.hostDashboard = async (req, res) => {
  try {
    const hostId = req.user._id;

    // Host's Listings
    const listings = await Listing.find({ owner: hostId });

    // Total Listings
    const totalListings = listings.length;

    // Host Bookings
    const bookings = await Booking.find({ host: hostId });

    // Total Bookings
    const totalBookings = bookings.length;

    // Monthly Earnings (example – adjust your Booking schema as needed)
    const monthlyEarnings = bookings.reduce((sum, b) => {
      return sum + (b.totalAmount || 0);
    }, 0);

    // Host Reviews
    const reviews = await Review.find({ host: hostId });

    res.render("dashboards/hostDashboard", {
      host: req.user,  // 👈 add this
      listings,
      bookings,
      reviews,
      totalListings,
      totalBookings,
      monthlyEarnings,
    });
  } catch (err) {
    console.log(err);
    res.send("Error loading host dashboard");
  }
};

// / SHOW EDIT FORM
module.exports.renderEditProfileHost = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.render("dashboards/editHostdashboard", { host: req.user });
};



// UPDATE PROFILE
module.exports.updateProfileHost = async (req, res) => {
  try {
    const { username, bio } = req.body;
    const updateData = { username, bio };

    // If user uploaded a new image, save its Cloudinary URL
    if (req.file) {
      updateData.profileImage = req.file.path; // multer-storage-cloudinary automatically gives URL in path
    }

    await User.findByIdAndUpdate(req.user._id, updateData);

    req.flash("success", "Profile updated successfully!");
    res.redirect("/host/dashboard");
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/host/edit");
  }
};


// Render creat listing form for host 
module.exports.renderNewForm = (req, res) => {
  res.render("listings/createListing.ejs");
};
