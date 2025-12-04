const User = require("../models/userModel");
const passport = require("passport"); // ✅ ADDED
const sendWelcomeEmail = require("../nodemailer");
const Listing = require("../models/listingModel");
const Booking = require("../models/bookingModel"); // If you have bookings
const Review = require("../models/reviewModel"); // If you have bookings

module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};



module.exports.signup = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    const user = new User({ username, email, role });
    const registeredUser = await User.register(user, password);

    // Send welcome email
    await sendWelcomeEmail(
      registeredUser.email,
      "Welcome to Wanderlust!",
      `<h2>Hello ${registeredUser.username}!</h2>
       <p>Your account has been created successfully.</p>`
    );

    req.login(registeredUser, (err) => {
      if (err) return next(err);

      if (registeredUser.role === "admin") return res.redirect("/admin/dashboard"); 
      if (registeredUser.role === "host") return res.redirect("/host/dashboard");

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
  const role = req.user.role;

  if (role === "admin") return res.redirect("/admin/dashboard");
  if (role === "host") return res.redirect("/host/dashboard");

  return res.redirect("/dashboard");

};



























































module.exports.userDashboard = async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("listings")
    .populate("wishlist")
    .populate({
      path: "reviews",
      populate: { path: "listing" },
    })
    .populate({
      path: "bookings",
      populate: { path: "listing" },
    });

  // Ensure arrays always exist
  user.listings = user.listings || [];
  user.wishlist = user.wishlist || [];
  user.bookings = user.bookings || [];
  user.reviews = user.reviews || [];

  res.render("dashboards/userdashboard.ejs", { user });
};






// / SHOW EDIT FORM
module.exports.renderEditProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.render("dashboards/editUserdashboard", { user });

};






// UPDATE PROFILE
module.exports.updateProfile = async (req, res) => {
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
    res.redirect("/user/edit");
  }
};
















































module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are Logged Out !");
    res.redirect("/listings");
  });
};
























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
