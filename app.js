// ============================================================================
// IMPORTS & DEPENDENCIES
// ============================================================================

// Env REquire : 
if(process.env.NODE_ENV != 'production'){
  require('dotenv').config();
}



const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listingRoute.js");
const reviewRouter = require("./routes/reviewRoute.js");
const userRouter = require("./routes/userRoute.js");

const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');

// ============================================================================
// DATABASE CONNECTION
// ============================================================================


const mongoURL = process.env.ATLAS_DB_URL;
async function main() {
  await mongoose.connect(mongoURL);
}

main()
  .then(() => console.log("✅ Connected to DB successfully!"))
  .catch((err) => console.log("❌ DB connection error:", err));

// ============================================================================
// APP CONFIGURATION
// ============================================================================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parse incoming form data
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));


// Mongo -session -store:
const store = MongoStore.create({
  mongoUrl : mongoURL,
  crypto : { 
    secret : process.env.SECRET,
  },
  touchAfter : 24 * 3600,
});

store.on("errror" , () => {
  console.log("ERROR in ONGO SESSION : " , err);
});


// FOR express session: 
const sessionOptions = {
  store : store,
  secret : process.env.SECRET,
  resave : false ,
  saveUninitialized : true,
  cookie : {
    expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge : 7 * 24 * 60 * 60 * 1000,
    httpOnly : true
  },
};




app.use(session(sessionOptions));
app.use(flash());



// app.get("/", (req, res) => {
//   res.send("Hi, I am root");
// });


// for each request passport initialize:
app.use(passport.initialize());
app.use(passport.session());        //for each req. of same user no need to login againg and again..(req.know : which session part is i am )
passport.use(new LocalStrategy({ usernameField: "email" }, User.authenticate())); // pass model in it.

passport.serializeUser(User.serializeUser());         //add info of user in to session
passport.deserializeUser(User.deserializeUser());     //remove info of user in to session,when session over

app.use( async(req, res , next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;   //login , signup
  next();
});


app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/" , userRouter);

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================

// Handle invalid routes (404)
app.all(/.*/, (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// Centralized error handler
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something Went Wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

mongoose.connection.on("connected", () => {
  console.log("Connected to DB:", mongoose.connection.name);
  console.log("📂 Current DB name:", mongoose.connection.name);
  console.log("📡 Host:", mongoose.connection.host);
});

// ============================================================================
// SERVER SETUP
// ============================================================================
app.listen(8080, () => {
  console.log("🚀 Server is running on http://localhost:8080");
});
