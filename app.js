// ============================================================================
// IMPORTS & DEPENDENCIES
// ============================================================================

// Environment Variables Configuration
if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

// Core Express Modules
const express = require("express");

const app = express();
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

// Database & Session Management
const mongoose = require("mongoose");

const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');

// Authentication
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/userModel.js"); // Assuming User model for Passport
const createDefaultAdmin = require('./utils/createDefaulyAdmin.js');

const Booking = require("./models/bookingModel.js");

// Utilities & Error Handling
const ExpressError = require("./utils/ExpressError.js");

// Route Imports
const listingRouter = require("./routes/listingRoute.js");
const reviewRouter = require("./routes/reviewRoute.js");
const userRouter = require("./routes/userRoute.js");
const adminRouter = require('./routes/adminRoute.js');
// const hostRouter = require('./routes/hostRoute.js');
const bookingRoutes = require("./routes/bookingRoute.js");
const staticRoutes = require("./routes/staticRoute.js");

// ============================================================================
// DATABASE CONNECTION
// ============================================================================
const mongoURL = process.env.ATLAS_DB_URL;

async function main() {
    await mongoose.connect(mongoURL);
}

main()
  .then(async () => {
    console.log("✅ Connected to DB successfully!");
    // await createDefaultAdmin();
  })
  .catch((err) => console.log("❌ DB connection error:", err));

// ============================================================================
// APP CONFIGURATION & MIDDLEWARE
// ============================================================================

// EJS & EJS-Mate Configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// Standard Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parse incoming form data
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public"))); // Serve static files

// --- Session Store Configuration (MongoDB) ---
const store = MongoStore.create({
    mongoUrl: mongoURL,
    crypto: { 
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600, // Update session every 24 hours unless data changes
});

store.on("error", (err) => {
    console.log("ERROR in Mongo Session Store:", err);
});

// --- Express Session Options ---
const sessionOptions = {
    store: store,
    secret: process.env.SECRET,
    resave: false, 
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true, // Prevent client-side JS from reading the cookie
    },
};

app.use(session(sessionOptions));
app.use(flash());

// --- Passport Authentication Configuration ---
app.use(passport.initialize());
app.use(passport.session()); 

// Make current user available in all EJS files
app.use((req, res, next) => {
  res.locals.currUser = req.user;
  next();
});

// Use LocalStrategy with the User model's authenticate method (custom login field)
passport.use(new LocalStrategy({ usernameField: "email" }, User.authenticate())); 

// Use User.createStrategy() for default username/password handling (often used for registration)
passport.use(User.createStrategy()); 

// Serialization/Deserialization
passport.serializeUser(User.serializeUser()); 
passport.deserializeUser(User.deserializeUser());

// --- Response Locals Middleware ---
// Makes flash messages and current user available to all templates
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user; // User object provided by Passport
    next();
});

// ============================================================================
// ROUTES (Route Handlers)
// ============================================================================

// Root Route - Redirects to the main listings page
app.get("/", (req, res) => {
    res.redirect("/listings");
});

// Use Router files for specific paths
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter); // Nested reviews route
app.use("/", userRouter);
app.use("/admin", adminRouter);
// app.use("/host", hostRouter);

app.use("/bookings", bookingRoutes); // User authentication routes
app.use("/", staticRoutes);

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================

// Handle invalid routes (404) - MUST BE THE LAST ROUTE DEFINITION BEFORE ERROR HANDLER
app.all(/.*/, (req, res, next) => { 
    next(new ExpressError(404, "Page Not Found!"));
});

// Centralized error handler
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something Went Wrong!" } = err;
    res.status(statusCode).render("error.ejs", { message });
});

// ============================================================================
// SERVER SETUP
// ============================================================================
app.listen(8080, () => {
    console.log("🚀 Server is running on http://localhost:8080");
});
