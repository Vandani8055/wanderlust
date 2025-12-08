const Booking = require("../models/bookingModel");
const Listing = require("../models/listingModel");
const User = require("../models/userModel");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);


// --- Show booking form ---

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


// ✅ CREATE STRIPE SESSION (UPDATED WITH OVERLAP CHECK)

module.exports.createStripeSession = async (req, res) => {
  try {
    const { listingId } = req.params;
    const { checkIn, checkOut } = req.body;

    // ✅ DATE VALIDATION - PREVENT PAST DATES
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate < today) {
      req.flash("error", "You cannot select a past check-in date!");
      return res.redirect(`/bookings/${listingId}`);
    }

    if (checkOutDate <= checkInDate) {
      req.flash("error", "Check-out must be after check-in date!");
      return res.redirect(`/bookings/${listingId}`);
    }

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).send("Listing not found");

    /* 🔴🔴🔴 START: OVERLAP PROTECTION (IMPORTANT CHANGE) 🔴🔴🔴 */
    const conflict = await Booking.findOne({
      listing: listingId,
      $or: [
        {
          checkIn: { $lte: checkOutDate },
          checkOut: { $gte: checkInDate }
        }
      ]
    });

    if (conflict) {
      req.flash("error", "Selected dates are already booked!");
      return res.redirect(`/bookings/${listingId}`);
    }
    /* 🔴🔴🔴 END: OVERLAP PROTECTION 🔴🔴🔴 */

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],

      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: listing.title,
            },
            unit_amount: listing.price * 100,
          },
          quantity: 1,
        },
      ],

      mode: "payment",

      metadata: {
        listingId: listing._id.toString(),
        checkIn,
        checkOut,
      },

      success_url: `${req.protocol}://${req.get(
        "host"
      )}/bookings/success?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url: `${req.protocol}://${req.get("host")}/bookings/${
        listing._id
      }`,
    });

    // ✅ Redirect to Stripe payment page
    res.redirect(303, session.url);
  } catch (error) {
    console.error(error);
    res.status(500).send("Stripe session creation failed");
  }
};


// ✅ PAYMENT SUCCESS HANDLER (UPDATED WITH SECOND SAFETY CHECK)

module.exports.bookingSuccess = async (req, res) => {
  try {
    if (!req.query.session_id) {
      return res.status(400).send("Missing Stripe session");
    }

    const session = await stripe.checkout.sessions.retrieve(
      req.query.session_id
    );

    const { listingId, checkIn, checkOut } = session.metadata;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (new Date(checkIn) < today) {
      return res.status(400).send("Invalid past booking date");
    }

    if (!listingId) {
      return res.status(400).send("Missing booking data");
    }

    const listing = await Listing.findById(listingId);

    /* 🔴🔴🔴 START: SECOND OVERLAP CHECK (CRITICAL SAFETY) 🔴🔴🔴 */
    const conflict = await Booking.findOne({
      listing: listingId,
      $or: [
        {
          checkIn: { $lte: new Date(checkOut) },
          checkOut: { $gte: new Date(checkIn) }
        }
      ]
    });

    if (conflict) {
      return res
        .status(409)
        .send("This date has already been booked by another user.");
    }
    /* 🔴🔴🔴 END: SECOND OVERLAP CHECK 🔴🔴🔴 */

    const booking = await Booking.create({
      user: req.user._id,
      listing: listingId,
      checkIn,
      checkOut,
      paymentId: session.payment_intent,
    });

    /* ✅ PROFILE UPDATE - DONT MODIFY */
    await User.findByIdAndUpdate(req.user._id, {
      $push: { bookings: booking._id },
    });

    res.render("users/success", { listing, checkIn, checkOut, booking });
  } catch (err) {
    console.error(err);
    res.status(500).send("Booking process failed");
  }
};
