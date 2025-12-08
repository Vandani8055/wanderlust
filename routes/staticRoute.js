const express = require("express");
const router = express.Router();

// Routes
router.get("/privacy", (req, res) => res.render("static/privacy")); // privacy page
router.get("/terms", (req, res) => res.render("static/terms"));     // terms page

module.exports = router;
