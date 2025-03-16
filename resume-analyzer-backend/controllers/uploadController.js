// controllers/uploadController.js
const fs = require("fs");
const axios = require("axios");
const bucket = require("../config/storage");

// Constructs the Document AI processor URL using environment variables
const docAIProcessorURL = `https://documentai.googleapis.com/v1/projects/${process.env.PROJECT_ID}/locations/us/processors/${process.env.PROCESSOR_ID}:process`;

exports.uploadResume = async (req, res) => {
  try {
    // Validate that a file was uploaded.
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded." });
    }

    // Log the received file details.
    console.log("Received file:", req.file.originalname, "at", req.file.path);

    // Local file path from multer and create a unique filename.
    const localFilePath = req.file.path;
    const filename = `${Date.now()}_${req.file.originalname}`;

    // Upload the file to GCS.
    console.log("Uploading file to GCS with filename:", filename);
    await bucket.upload(localFilePath, {
      destination: filename,
      resumable: false,
      // Removed legacy ACL options to comply with uniform bucket-level access.
    });
    console.log("File uploaded successfully to GCS.");

    // Verify that the file exists in GCS.
    const file = bucket.file(filename);
    const [exists] = await file.exists();
    if (!exists) {
      console.error("File does not exist in GCS after upload.");
      return res.status(500).json({ success: false, error: "File upload failed." });
    }

    // Delete the local temporary file asynchronously.
    fs.unlink(localFilePath, (err) => {
      if (err) console.error("Error deleting local file:", err);
      else console.log("Local file deleted:", localFilePath);
    });

    // Download the file from GCS into memory.
    console.log("Downloading file from GCS...");
    const [fileData] = await file.download();
    console.log("File downloaded from GCS.");

    // Encode the file data to base64.
    const base64Content = fileData.toString("base64");
    console.log("File encoded to base64.");

    // Call Document AI API using the 'rawDocument' field with inline content.
    console.log("Calling Document AI API...");
    const response = await axios.post(
      docAIProcessorURL,
      {
        rawDocument: {
          content: base64Content,
          mimeType: "application/pdf"
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DOC_AI_TOKEN}`
        }
      }
    );
    console.log("Document AI API response received.");

    // Extract text from the API response (adjust extraction based on your processor's response).
    const extractedText = response.data.document?.text || "No text extracted.";

    // Return the extracted text as a JSON response.
    return res.json({ success: true, text: extractedText });
  } catch (error) {
    console.error("Error processing resume:", error.response ? error.response.data : error);
    return res.status(500).json({ success: false, error: "Failed to process resume." });
  }
};
