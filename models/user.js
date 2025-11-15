const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

//username,passwor:automatically done by  "passportLocalMongoose"
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Listing" }],
});
// Tell passport-local-mongoose to use "email" as username field
userSchema.plugin(passportLocalMongoose, { usernameField: "email", usernameUnique: false });

module.exports = mongoose.model("User", userSchema);
