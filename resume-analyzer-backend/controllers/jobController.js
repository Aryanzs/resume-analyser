// controllers/jobController.js
const fs = require("fs");
const axios = require("axios");
const { GoogleAuth } = require("google-auth-library");
const bucket = require("../config/storage");

// Use the JOB_PROCESSOR_ID if provided; otherwise, fall back to PROCESSOR_ID.
const docAIJobProcessorURL = `https://documentai.googleapis.com/v1/projects/${process.env.PROJECT_ID}/locations/us/processors/${process.env.JOB_PROCESSOR_ID || process.env.PROCESSOR_ID}:process`;

/**
 * Upload Job Description as Text
 * - Accepts job description text in req.body.jobDescription.
 * - Saves the text directly in session for later comparison.
 */
exports.uploadJobDescriptionText = async (req, res) => {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription) {
      return res.status(400).json({ success: false, error: "Job description text is required." });
    }

    // Store the job description text in session.
    req.session.lastJobDescription = jobDescription;
    console.log("Job description (text) saved to session.");

    return res.json({ success: true, message: "Job description (text) saved successfully." });
  } catch (error) {
    console.error("Error saving job description (text):", error);
    return res.status(500).json({ success: false, error: "Failed to save job description text." });
  }
};

/**
 * Upload Job Description as File
 * - Uses multer to handle file input.
 * - Uploads the file to GCS under the "job-descriptions/" folder.
 * - Calls Document AI to extract text from the file.
 * - Saves the extracted text in session for later comparison.
 */
exports.uploadJobDescriptionFile = async (req, res) => {
  try {
    // Validate that a file was uploaded.
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No job description file uploaded." });
    }

    console.log("Received job description file:", req.file.originalname, "at", req.file.path);

    // Create a unique filename and set the destination with a folder prefix.
    const localFilePath = req.file.path;
    const filename = `${Date.now()}_${req.file.originalname}`;
    const destinationPath = `job-descriptions/${filename}`;

    // Upload the file to GCS under the "job-descriptions/" folder.
    console.log("Uploading job description to GCS with destination:", destinationPath);
    await bucket.upload(localFilePath, {
      destination: destinationPath,
      resumable: false,
    });
    console.log("Job description file uploaded successfully to GCS.");

    // Verify the file exists in GCS.
    const file = bucket.file(destinationPath);
    const [exists] = await file.exists();
    if (!exists) {
      console.error("Job description file does not exist in GCS after upload.");
      return res.status(500).json({ success: false, error: "Job description file upload failed." });
    }

    // Delete the local file.
    fs.unlink(localFilePath, (err) => {
      if (err) console.error("Error deleting local job file:", err);
      else console.log("Local job file deleted:", localFilePath);
    });

    // Download the file from GCS into memory.
    console.log("Downloading job file from GCS...");
    const [fileData] = await file.download();
    console.log("Job file downloaded from GCS.");

    // Convert the file data to base64.
    const base64Content = fileData.toString("base64");
    console.log("Job file encoded to base64.");

    // Obtain a fresh access token using google-auth-library.
    const auth = new GoogleAuth({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: "https://www.googleapis.com/auth/cloud-platform",
    });
    const accessToken = await auth.getAccessToken();
    console.log("Access token acquired for job description processing.");

    // Call Document AI to extract text from the job description file.
    console.log("Calling Document AI for job description...");
    const response = await axios.post(
      docAIJobProcessorURL,
      {
        rawDocument: {
          content: base64Content,
          mimeType: "application/pdf", // Adjust if the file is DOCX, etc.
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log("Document AI response for job description received.");

    // Extract text from the Document AI response.
    const extractedJobText = response.data.document?.text || "No text extracted from job description.";

    // Store the extracted text in session.
    req.session.lastJobDescription = extractedJobText;
    console.log("Job description text (from file) stored in session.");

    return res.json({
      success: true,
      message: "Job description file processed successfully.",
      jobText: extractedJobText,
    });
  } catch (error) {
    console.error("Error processing job description file:", error.response ? error.response.data : error);
    return res.status(500).json({ success: false, error: "Failed to process job description file." });
  }
};
