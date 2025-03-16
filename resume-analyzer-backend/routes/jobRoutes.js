// routes/jobRoutes.js
const express = require("express");
const multer = require("multer");
const {
  uploadJobDescriptionText,
  uploadJobDescriptionFile,
} = require("../controllers/jobController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Route for text-based job description
// POST /api/job/upload-text
router.post("/upload-text", uploadJobDescriptionText);

// Route for file-based job description
// POST /api/job/upload-file, with "jobFile" as the file field name
router.post("/upload-file", upload.single("jobFile"), uploadJobDescriptionFile);

module.exports = router;
