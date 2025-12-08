const express = require("express");
const router = express.Router();
const passport = require("passport");
const multer = require("multer");

const User = require("../models/userModel.js");
const Listing = require("../models/listingModel.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { upload } = require("../cloudConfig");

const usersController = require("../controllers/usersController.js");
const { saveRedirectUrl, isLoggedIn, isAdmin, isUser } = require("../middleware.js");

/* ===============================
   AUTH ROUTES
================================ */

// Signup
router
  .route("/signup")
  .get(usersController.renderSignupForm)
  .post(wrapAsync(usersController.signup));

// Login
router
  .route("/login")
  .get(usersController.renderLoginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    usersController.login
  );

// Logout
router.get("/logout", usersController.logout);

/* ===============================
   DASHBOARD ROUTES (ROLE-BASED)
================================ */

// User dashboard
// router.get("/dashboard", isLoggedIn, isUser, usersController.userDashboard);
// router.get("/user/edit", isLoggedIn, usersController.renderEditProfile);
// router.put("/user/edit", isLoggedIn, upload.single("profileImage"), usersController.updateProfile);





// Host dashboard
router.get("/dashboard", isLoggedIn, usersController.userDashboard);

router.get("/edit", isLoggedIn, usersController.renderEditProfileUser);
router.put("/edit", isLoggedIn, upload.single("profileImage"), usersController.updateProfileUser);



// Add the listing route here
router.get("/listings/new", isLoggedIn, (req, res) => {
    res.render("listings/createListing");
});







/* ===============================
   WISHLIST ROUTES
================================ */

// Add or remove from wishlist
router.post("/wishlist/:listingId", isLoggedIn, usersController.wishlistAddRemove);

// View wishlist
router.get("/wishlist", isLoggedIn, usersController.showAllWishlist);

module.exports = router;
