const Listing = require("../models/listingModel.js");
const Review = require("../models/reviewModel.js");
const User = require('./../models/userModel.js');

module.exports.createReview = async (req, res) => {

  const listing = await Listing.findById(req.params.id);

  /* ================= 🎯 CRITICAL CHANGE START ================= */

  const newReview = new Review({
    rating: req.body.review.rating,
    comment: req.body.review.comment,
    author: req.user._id,
    listing: listing._id     // ✅✅ THIS IS THE MOST IMPORTANT LINE
  });

  /* ================= 🎯 CRITICAL CHANGE END =================== */

  // ✅ store review id inside listing
  listing.reviews.push(newReview._id);

  await newReview.save();

  // ✅ store review id inside USER for profile page
  await User.findByIdAndUpdate(req.user._id, {
    $push: { reviews: newReview._id }
  });

  await listing.save();

  req.flash("success", "New Review Created! 🎉");
  res.redirect(`/listings/${listing._id}`);
};





module.exports.deleteReview = async (req, res) => {
  let { id, reviewId } = req.params;

  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", " Review Deleted!🎉");
  res.redirect(`/listings/${id}`);
};
