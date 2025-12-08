const express = require("express");
const router = express.Router();

const { isLoggedIn, isAdmin } = require("../middleware");
const { upload } = require("../cloudConfig");
const adminController = require("../controllers/adminController");


// ADMIN DASHBOARD & PROFILE
router.get("/dashboard", isLoggedIn, isAdmin, adminController.adminDashboard);
router.get("/edit", isLoggedIn, isAdmin, adminController.renderEditProfileAdmin);
router.put(
  "/edit",
  isLoggedIn,
  isAdmin,
  upload.single("profileImage"),
  adminController.updateProfileAdmin
);


// ADMIN DELETE ACTIONS
// Delete a user
router.post("/users/:id/delete", isLoggedIn, isAdmin, adminController.deleteUser);

// Delete a booking
router.post("/bookings/:id/delete", isLoggedIn, isAdmin, adminController.deleteBooking);

module.exports = router;
