const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");
const reviewController = require("../controllers/reviewsController.js");

// Routes
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview)); // create review
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.deleteReview)); // delete review

module.exports = router;
