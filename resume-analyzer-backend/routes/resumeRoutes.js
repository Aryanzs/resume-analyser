// routes/resumeRoutes.js
const express = require("express");
const multer = require("multer");
const { uploadResume } = require("../controllers/resumeController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Route: POST /api/resume/upload
router.post("/upload", upload.single("resume"), uploadResume);

module.exports = router;
