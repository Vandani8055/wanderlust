const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./reviewModel.js");

const listingSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  location: { type: String, required: true },

  image: {
    url: { type: String, default: "" },
    filename: { type: String, default: "listingimage" },
  },
  reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
  owner: { type: Schema.Types.ObjectId, ref: "User" },
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      default: [],
    },
  },
  tags: {
    type: [String],
    required: true,
    set: (v) => v.map((t) => t.toLowerCase().trim()),
  },
});


// when listing delete review of listing also delete : automatically
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    // await Review.deleteMany({ _id: { $in: listing.reviews } });
    await Review.deleteMany({ listing: listing._id });

  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;

// -----------------------------------------------------------------------------
// 📝 NOTE:
// set : (v) => v === "" ? "https://www.google.com/url?sa=i&url=https%3A%2F%2Feastwest.com%2Finsights%2Fvacation-rentals%2F..." : v
// → This ensures that even if the image URL is empty, a fallback default image is always used.
// -----------------------------------------------------------------------------
