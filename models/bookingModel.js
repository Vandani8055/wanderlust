const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  listing: {
    type: Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },

  checkIn: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // remove time
        return value >= today;
      },
      message: "Check-in date cannot be in the past"
    }
  },

  checkOut: {
    type: Date,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Booking", bookingSchema);
