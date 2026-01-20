const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
// username, password: automatically handled by passport-local-mongoose
const userSchema = new Schema({
  username: String,
  email: String,
  profileImage: String,
  bio: String,

  listings: [{
    type: Schema.Types.ObjectId,
    ref: "Listing"
  }],

  wishlist: [{
    type: Schema.Types.ObjectId,
    ref: "Listing"
  }],

  reviews: [{
    type: Schema.Types.ObjectId,
    ref: "Review"
  }],

  bookings: [{
    type: Schema.Types.ObjectId,
    ref: "Booking"
  }],

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user", 
  }
});

// Tell passport-local-mongoose to use "email" as username field
userSchema.plugin(passportLocalMongoose, {
  usernameField: 'email',
  usernameUnique: false
});


module.exports = mongoose.model("User", userSchema);
