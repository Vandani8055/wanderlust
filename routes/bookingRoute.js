const express = require("express");
const router = express.Router();
const bookingsController = require("../controllers/bookingsController");
const { isLoggedIn } = require("../middleware");

router.get("/success", isLoggedIn, bookingsController.bookingSuccess);
router.get("/:listingId", isLoggedIn, bookingsController.showBookingForm);
router.post("/:listingId", isLoggedIn, bookingsController.createStripeSession);



module.exports = router;
