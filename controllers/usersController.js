const User = require("../models/user");

module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res) => {
  try {
    let { email, password } = req.body;
    const newUser = new User({ email });
    const registerUser = await User.register(newUser, password);
    console.log(registerUser);
    // auto login when sign up:
    req.login(registerUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to Wanderlust");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = (req, res) => {
  req.flash("success", "Welcome back to Wanderlust!");

  const redirectUrl = req.session.returnTo || "/listings";
  delete req.session.returnTo;

  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are Logged Out !");
    res.redirect("/listings");
  });
};

module.exports.showAllWishlist = async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");

  res.render("wishlist", {
    wishlist: user.wishlist,
    currUser: req.user,
  });
};

module.exports.wishlistAddRemove = async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Login required" });

  const listingId = req.params.listingId;
  const user = await User.findById(req.user._id);

  if (user.wishlist.includes(listingId)) {
    user.wishlist.pull(listingId); // REMOVE
  } else {
    user.wishlist.push(listingId); // ADD
  }

  await user.save();
  res.json({ wishlist: user.wishlist });
};
