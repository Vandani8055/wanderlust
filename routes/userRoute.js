const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user.js");
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { saveRedirectUrl, isLoggedIn } = require("../middleware.js");
const usersController = require("../controllers/usersController.js");

// Signup
router
  .route("/signup")
  .get(usersController.renderSignupForm)
  .post(wrapAsync(usersController.signup));


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



// wishlist
router.post("/wishlist/:listingId", usersController.wishlistAddRemove);
router.get("/wishlist", isLoggedIn, usersController.showAllWishlist);

// Logout
router.get("/logout", usersController.logout);

module.exports = router;
