const User = require("./../models/userModel");
const Listing = require("./../models/listingModel");
const Review = require("./../models/reviewModel");
const Booking = require("./../models/bookingModel");



module.exports.hostDashboard = async (req, res) => {
  try {
    const hostId = req.user._id;

    // Fetch only listings created by THIS host
   const listings = await Listing.find({ owner: hostId })
    .populate({
      path: "reviews",
      populate: {
        path: "author",
        select: "username profileImage"
      }
    });

    // Count listings
    const totalListings = listings.length;

    // Count bookings of host → based on listings
    const totalBookings = await Booking.countDocuments({
      listing: { $in: listings.map(l => l._id) }
    });

    res.render("dashboards/hostDashboard", {
  
      host: req.user,
      listings,
      totalListings,
      totalBookings
    });

  } catch (err) {
    console.log(err);
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
