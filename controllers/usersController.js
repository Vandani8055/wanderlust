const User = require("../models/userModel");
const passport = require("passport"); // ✅ ADDED
const sendWelcomeEmail = require('../nodemailer');

module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
  try {
    let { email, password } = req.body;
    const newUser = new User({ email });
    const registerUser = await User.register(newUser, password);
    console.log(registerUser);

    // Send welcome email
    sendWelcomeEmail(email).catch(err => console.log("Email error:", err));

    // auto login when sign up:
    req.login(registerUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to Wanderlust");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = (req, res) => {
  req.flash("success", "Welcome back to Wanderlust!");
  const redirectUrl = req.session.returnTo || "/listings";
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};




// USER PROFILE :
module.exports.profilePage = async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("listings")
    .populate("wishlist")
    .populate({
      path: "reviews",
      populate: { path: "listing" }
    })
    .populate({
      path: "bookings",
       populate: { path: "listing" }
    });

  // Ensure arrays always exist
  user.listings = user.listings || [];
  user.wishlist = user.wishlist || [];
  user.bookings = user.bookings || [];
  user.reviews = user.reviews || [];

  res.render("users/profile.ejs", { user });
};



// / SHOW EDIT FORM
module.exports.renderEditProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.render("users/editProfile.ejs", { user });
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
    res.redirect("/profile");
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/edit");
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
