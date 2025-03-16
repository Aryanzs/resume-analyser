// routes/upload.js
const express = require("express");
const multer = require("multer");
const router = express.Router();
const { uploadResume } = require("../controllers/uploadController");

// Configure multer to use a temporary uploads folder
const upload = multer({ dest: "uploads/" });

// Define the /upload endpoint
router.post("/", upload.single("resume"), uploadResume);

module.exports = router;
