const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

module.exports.createReview = async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);
  //when came new review then store "author":
  newReview.author = req.user._id; // login user is author of review:
  console.log(newReview);
  listing.reviews.push(newReview); // This adds the new Review document's _id to the listing's reviews array

  await newReview.save();
  await listing.save(); // <--- This line saves the updated listing with the new review ID
  req.flash("success", "New Review Created!🎉");
  res.redirect(`/listings/${listing._id}`);
};

module.exports.deleteReview = async (req, res) => {
  let { id, reviewId } = req.params;

  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", " Review Deleted!🎉");
  res.redirect(`/listings/${id}`);
};
