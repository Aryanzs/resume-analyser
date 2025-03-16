// routes/compareRoutes.js
const express = require("express");
const { compareResumeWithJob } = require("../controllers/compareController");

const router = express.Router();

// Route: POST /api/compare
router.post("/", compareResumeWithJob);

module.exports = router;
