const Listing = require("./models/listingModel.js");
const Review = require("./models/reviewModel.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema");

// ============================================================================
// ROLE-BASED MIDDLEWARE
// ============================================================================

// Admin only access
module.exports.isAdmin = (req, res, next) => {
  // Prevent crafted session attack
  if (!req.user || !req.user._id) {
    req.logout(() => {});
    req.flash("error", "Session expired. Please login again.");
    return res.redirect("/login");
  }

  // Check authentication
  if (!req.isAuthenticated()) {
    req.flash("error", "Please login first!");
    return res.redirect("/login");
  }

  // Admin role check
  if (req.user.role !== "admin") {
    req.flash("error", "Not authorized!");
    return res.redirect("/");
  }

  next();
};

// User only access
module.exports.isUser = (req, res, next) => {
  if (!req.user || req.user.role !== "user") {
    req.flash("error", "Please log in as a user");
    return res.redirect("/login");
  }
  next();
};

// Logged-in check for creating listings
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to create Listing");
    return res.redirect("/login");
  }
  next();
};

// Save redirect URL after login
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

// Only owner or admin can delete/update listing
module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  // Admin full access
  if (res.locals.currUser.role === "admin") return next();

  // Owner check
  if (!listing.owner._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not owner of this listing");
    return res.redirect(`/listings/${id}`);
  }

  next();
};

// ============================================================================
// JOI VALIDATION MIDDLEWARE
// ============================================================================

// Validate listing input
module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(", ");
    throw new ExpressError(400, msg);
  }
  next();
};

// Validate review input
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(", ");
    return next(new ExpressError(400, msg));
  }
  next();
};

// Author or admin can edit/delete review
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);

  // Admin full access
  if (req.user.role === "admin") return next();

  // Owner check
  if (!review.author._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not owner of this review");
    return res.redirect(`/listings/${id}`);
  }

  next();
};
