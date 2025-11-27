const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/userModel.js");
const Listing = require("../models/listingModel.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { saveRedirectUrl, isLoggedIn } = require("../middleware.js");
const usersController = require("../controllers/usersController.js");
const multer = require('multer');
const { upload } = require("../cloudConfig"); // ✅ import upload


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

  router.get('/profile' , isLoggedIn, usersController.profilePage);
  // show edit page
router.get("/edit", isLoggedIn, usersController.renderEditProfile);

// update profile
router.put("/edit", upload.single('profileImage'), usersController.updateProfile);




// wishlist
router.post("/wishlist/:listingId", usersController.wishlistAddRemove);
router.get("/wishlist", isLoggedIn, usersController.showAllWishlist);

// Logout
router.get("/logout", usersController.logout);

module.exports = router;
