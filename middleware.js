const Listing = require('./models/listingModel.js');
const Review = require('./models/reviewModel.js');
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema , reviewSchema } = require('./schema');

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



// if not owner the not "EDIT , UPDATE , DELETE Listings( Authorization )":
module.exports.isOwner = async(req , res , next) => {
  const { id } = req.params;
    const listing = await Listing.findById(id);
    // if curruser and owner not match then not edit the listing:
    if (!listing.owner._id.equals(res.locals.currUser._id)) {
      req.flash('error', 'You are not owner of this listing');
      return res.redirect(`/listings/${id}`);
    }
    next();
}



// ============================================================================
// JOI VALIDATION MIDDLEWARE
// ===========================================================================
module.exports.validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(", ");
        throw new ExpressError(400, msg);
    } else next();
};


module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    
    if (error) {
        const msg = error.details.map(el => el.message).join(", ");
        
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


// if not owner the not "EDIT , UPDATE , DELETE Reviews( Authorization )":
module.exports.isReviewAuthor = async(req , res , next) => {
  const { id , reviewId } = req.params;
    const review = await Review.findById(reviewId);
    // if curruser and owner not match then not edit the Review:
    if (!review.author._id.equals(res.locals.currUser._id)) {
      req.flash('error', 'You are not owner of this review');
      return res.redirect(`/listings/${id}`);
    }
    next();
}
