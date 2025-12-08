// const express = require("express");
// const router = express.Router();
// const listingController = require('./../controllers/listingsController');
// const { isLoggedIn, isHost } = require("../middleware");
// const { upload } = require("../cloudConfig");
// const hostController = require("../controllers/hostController");

// // Host dashboard
// router.get("/dashboard", isLoggedIn, isHost, hostController.hostDashboard);
// router.get("/edit", isLoggedIn, hostController.renderEditProfileHost);
// router.put("/edit", isLoggedIn, upload.single("profileImage"), hostController.updateProfileHost);


// // Render creat listing form for host 
// router.get("/listings/new", isLoggedIn, listingController.renderNewForm);

// module.exports = router;
