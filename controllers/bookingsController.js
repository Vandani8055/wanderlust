const Booking = require("../models/bookingModel");
const Listing = require("../models/listingModel");
const User = require('../models/userModel');
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);


// SHOW BOOKING FORM
module.exports.showBookingForm = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.listingId);
    if (!listing) return res.status(404).send("Listing not found");

    res.render("users/booking", { listing });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading booking page");
  }
};


// ✅ CREATE STRIPE SESSION (FIXED)
module.exports.createStripeSession = async (req, res) => {
  try {
    const { listingId } = req.params;
    const { checkIn, checkOut } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).send("Listing not found");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],

      line_items: [{
        price_data: {
          currency: "inr",
          product_data: {
            name: listing.title,
          },
          unit_amount: listing.price * 100,
        },
        quantity: 1,
      }],

      mode: "payment",

      metadata: {
        listingId: listing._id.toString(),
        checkIn,
        checkOut,
      },

      success_url: `${req.protocol}://${req.get("host")}/bookings/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.protocol}://${req.get("host")}/bookings/${listing._id}`,
    });

    // ✅ Redirect to Stripe payment page
    res.redirect(303, session.url);

  } catch (error) {
    // console.error(error);
    res.status(500).send("Stripe session creation failed");
  }
};


// ✅ PAYMENT SUCCESS HANDLER (CORRECT)
module.exports.bookingSuccess = async (req, res) => {
  try {
    if (!req.query.session_id) {
      return res.status(400).send("Missing Stripe session");
    }

    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
    const { listingId, checkIn, checkOut } = session.metadata;

    if (!listingId) {
      return res.status(400).send("Missing booking data");
    }

    const listing = await Listing.findById(listingId);

    const booking = await Booking.create({
      user: req.user._id,
      listing: listingId,
      checkIn,
      checkOut,
      paymentId: session.payment_intent,
    });


    /* ================= 🔥 CRITICAL ADDITION 🔥 ================= */

    await User.findByIdAndUpdate(req.user._id, {
      $push: { bookings: booking._id }   // ✅ THIS MAKES PROFILE UPDATE
    });

    /* ============================================================ */

    res.render("users/success", { listing, checkIn, checkOut, booking });

  } catch (err) {
    // console.error(err);
    res.status(500).send("Booking process failed");
  }
};








