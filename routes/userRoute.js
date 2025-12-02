const express = require("express");
const router = express.Router();
const passport = require("passport");
const multer = require("multer");

const User = require("../models/userModel.js");
const Listing = require("../models/listingModel.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { upload } = require("../cloudConfig");

const usersController = require("../controllers/usersController.js");
const { saveRedirectUrl, isLoggedIn, isAdmin, isHost, isUser } = require("../middleware.js");

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

// Admin dashboard
router.get("/admin/dashboard", isLoggedIn, isAdmin, usersController.adminDashboard);
router.get("/admin/edit", isLoggedIn, usersController.renderEditProfileAdmin);
router.put("/admin/edit", isLoggedIn, upload.single("profileImage"), usersController.updateProfileAdmin);

// Host dashboard
router.get("/host/dashboard", isLoggedIn, isHost, usersController.hostDashboard);
router.get("/host/edit", isLoggedIn, usersController.renderEditProfile);
router.put("/host/edit", isLoggedIn, upload.single("profileImage"), usersController.updateProfile);




// User dashboard
router.get("/dashboard", isLoggedIn, isUser, usersController.userDashboard);
router.get("/user/edit", isLoggedIn, usersController.renderEditProfile);
router.put("/user/edit", isLoggedIn, upload.single("profileImage"), usersController.updateProfile);

/* ===============================
   WISHLIST ROUTES
================================ */

// Add or remove from wishlist
router.post("/wishlist/:listingId", isLoggedIn, usersController.wishlistAddRemove);

// View wishlist
router.get("/wishlist", isLoggedIn, usersController.showAllWishlist);

module.exports = router;
