const express = require("express");
const router = express.Router();

// Privacy Page Route
router.get("/privacy", (req, res) => {
  res.render("static/privacy");
});

// Terms Page Route (optional)
router.get("/terms", (req, res) => {
  res.render("static/terms");
});

module.exports = router;
