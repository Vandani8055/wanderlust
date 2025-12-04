const User = require("./../models/userModel");
const Listing = require("./../models/listingModel");
const Review = require("./../models/reviewModel");
const Booking = require("./../models/bookingModel");

module.exports.hostDashboard = async (req, res) => {
  try {
    const hostId = req.user._id;

    // 1. Fetch all listings created by this host
    const listings = await Listing.find({ owner: hostId });

    // 2. Extract listing IDs
    const listingIds = listings.map((l) => l._id);

    // 3. Count total listings
    const totalListings = listings.length;

    // 4. Fetch all bookings for host’s listings
    const bookings = await Booking.find({
      listing: { $in: listingIds }
    })
      .populate('user' , "username")       // populate guest/user name
      .populate('listing', 'title');  // populate listing title

    // 5. Count total bookings
    const totalBookings = bookings.length;

    // 6. Fetch all reviews for host’s listings
    const reviews = await Review.find({
      listing: { $in: listingIds }
    })
      .populate("author", "username profileImage")
      .populate("listing", "title");

    // 7. Count total reviews
    const totalReviews = reviews.length;

    // 8. Render Dashboard
    res.render("dashboards/hostDashboard", {
      host: req.user,
      currUser: req.user,
      listings,
      totalListings,
      bookings,        // <--- send bookings array to template
      totalBookings,
      reviews,
      totalReviews
    });

  } catch (err) {
    console.log("Host Dashboard Error:", err);
    res.redirect("/");
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
