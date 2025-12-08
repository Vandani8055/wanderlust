const express = require("express");
const router = express.Router();
const passport = require("passport");
const { upload } = require("../cloudConfig");
const wrapAsync = require("../utils/wrapAsync.js");
const usersController = require("../controllers/usersController.js");
const { saveRedirectUrl, isLoggedIn } = require("../middleware.js");


// AUTH ROUTES
router.route("/signup")                         // signup
  .get(usersController.renderSignupForm)
  .post(wrapAsync(usersController.signup));

router.route("/login")                          // login
  .get(usersController.renderLoginForm)
  .post(saveRedirectUrl, passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true
  }), usersController.login);

router.get("/logout", usersController.logout);  // logout


// DASHBOARD / PROFILE
router.get("/dashboard", isLoggedIn, usersController.userDashboard);      // user dashboard
router.get("/edit", isLoggedIn, usersController.renderEditProfileUser);  // edit profile form
router.put("/edit", isLoggedIn, upload.single("profileImage"), usersController.updateProfileUser); // update profile

// Add new listing form
router.get("/listings/new", isLoggedIn, (req, res) => res.render("listings/createListing")); // new listing


// WISHLIST ROUTES
router.post("/wishlist/:listingId", isLoggedIn, usersController.wishlistAddRemove); // toggle wishlist
router.get("/wishlist", isLoggedIn, usersController.showAllWishlist);              // view wishlist

module.exports = router;
