const Listing = require("./models/listingModel.js");
const Review = require("./models/reviewModel.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema");




// ROLE BASE SELECTION :

module.exports.isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    req.flash("error", "Not authorized!");
    return res.redirect("/");
  }
  next();
};

module.exports.isHost = (req, res, next) => {
  if (req.user.role !== "host") {
    req.flash("error", "Not authorized!");
    return res.redirect("/");
  }
  next();
};

module.exports.isUser = (req, res, next) => {
  if (req.user.role !== "user") {
    req.flash("error", "Not authorized!");
    return res.redirect("/");
  }
  next();
};









// Login
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // redirectUrl save(req.originalUrl):if user noty loggin:
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to create Listing");
    return res.redirect("/login");
  }
  next();
};

// PostLogin:
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};



// host and admin allow to delete listing : not user have right :
module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  // Safety: If no listing found
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  // ✔ Allow admin full access
  if (res.locals.currUser.role === "admin") {
    return next();
  }

  // ✔ Check owner
  if (!listing.owner._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not owner of this listing");
    return res.redirect(`/listings/${id}`);
  }

  next();
};


// ============================================================================
// JOI VALIDATION MIDDLEWARE
// ===========================================================================
module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, msg);
  } else next();
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);

  if (error) {
    const msg = error.details.map((el) => el.message).join(", ");

    // 🔑 FIX: Instead of 'throw', create the error and pass it to next().
    const validationError = new ExpressError(400, msg);

    // This tells Express to stop processing the current route and jump
    // to the 4-argument error handler middleware.
    return next(validationError);
  } else {
    // Validation passed, continue to the next middleware/route handler
    next();
  }
};


// Author and Admin can delete review other not have permition like host:
// if not owner the not "EDIT , UPDATE , DELETE Reviews( Authorization )":
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);

  // ALLOW ADMIN
  if (req.user.role === "admin") {
    return next();
  }
  
  // if curruser and owner not match then not edit the Review:
  if (!review.author._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not owner of this review");
    return res.redirect(`/listings/${id}`);
  }
  next();
};
