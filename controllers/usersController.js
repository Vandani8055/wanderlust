const User = require("../models/userModel");
const passport = require("passport"); // ✅ ADDED
const sendWelcomeEmail = require("../nodemailer");
const Listing = require("../models/listingModel");
const Booking = require("../models/bookingModel"); // If you have bookings
const Review = require("../models/reviewModel"); // If you have bookings


// --- Auth views ---

module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};


module.exports.signup = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    const allowedRoles = ['user'];
    const safeRole = allowedRoles.includes(role) ? role : 'user';

    const user = new User({ username, email, role: safeRole });
    const registeredUser = await User.register(user, password);

    // Send welcome email
    await sendWelcomeEmail(
      registeredUser.email,
      "Welcome to Wanderlust!",
      `<h2>Hello ${registeredUser.username}!</h2>
       <p>Your account has been created successfully.</p>`
    );

    // ✅ Auto login + correct redirect
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      if (registeredUser.role === "admin") return res.redirect("/admin/dashboard");
      return res.redirect("/dashboard");
    });

  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/signup");
  }
};


module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};


module.exports.login = (req, res) => {
  req.flash("success", "Welcome back to Wanderlust!");

  if (req.user.role === "admin") {
    return res.redirect("/admin/dashboard");
  } else {
    return res.redirect("/dashboard");
  }
};


// --- User dashboard (active) ---

module.exports.userDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Fetch all listings created by this user
    const listings = await Listing.find({ owner: userId });

    // 2. Extract listing IDs
    const listingIds = listings.map((l) => l._id);

    // 3. Count total listings
    const totalListings = listings.length;

    // 4. Fetch all bookings for user’s listings
    const bookings = await Booking.find({
      listing: { $in: listingIds }
    })
      .populate('user', "username")       // populate guest/user name
      .populate('listing', 'title');      // populate listing title

    // 5. Count total bookings
    const totalBookings = bookings.length;

    // 6. Fetch all reviews for user’s listings
    const reviews = await Review.find({
      listing: { $in: listingIds }
    })
      .populate("author", "username profileImage")
      .populate("listing", "title");

    // 7. Count total reviews
    const totalReviews = reviews.length;

    // 8. Render Dashboard
    res.render("dashboards/userdashboard", {
      user: req.user,
      currUser: req.user,
      listings,
      totalListings,
      bookings,        // <--- send bookings array to template
      totalBookings,
      reviews,
      totalReviews
    });

  } catch (err) {
    console.log("user Dashboard Error:", err);
    res.redirect("/");
  }
};


// / SHOW EDIT FORM
module.exports.renderEditProfileUser = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.render("dashboards/editUserdashboard", { user: req.user });
};


// UPDATE PROFILE
module.exports.updateProfileUser = async (req, res) => {
  try {
    const { username, bio } = req.body;
    const updateData = { username, bio };

    // If user uploaded a new image, save its Cloudinary URL
    if (req.file) {
      updateData.profileImage = req.file.path; // multer-storage-cloudinary automatically gives URL in path
    }

    await User.findByIdAndUpdate(req.user._id, updateData);

    req.flash("success", "Profile updated successfully!");
    res.redirect("/dashboard");

  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/edit");
  }
};


// Render creat listing form for user
module.exports.renderNewForm = (req, res) => {
  res.render("listings/createListing.ejs");
};



// --- Logout ---

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }

    req.flash("success", "You are Logged Out !");
    res.redirect("/listings");
  });
};


// --- Wishlist ---

module.exports.showAllWishlist = async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");

  res.render("wishlist", {
    wishlist: user.wishlist,
    currUser: req.user,
  });
};


module.exports.wishlistAddRemove = async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Login required" });

  const listingId = req.params.listingId;
  const user = await User.findById(req.user._id);

  if (user.wishlist.includes(listingId)) {
    user.wishlist.pull(listingId); // REMOVE
  } else {
    user.wishlist.push(listingId); // ADD
  }

  await user.save();
  res.json({ wishlist: user.wishlist });
};
