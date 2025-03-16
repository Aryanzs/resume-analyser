// controllers/resumeController.js
const fs = require("fs");
const axios = require("axios");
const { GoogleAuth } = require("google-auth-library");
const bucket = require("../config/storage");

// Construct the Document AI processor URL using environment variables
const docAIProcessorURL = `https://documentai.googleapis.com/v1/projects/${process.env.PROJECT_ID}/locations/us/processors/${process.env.PROCESSOR_ID}:process`;

exports.uploadResume = async (req, res) => {
  try {
    // 1) Validate that a file was uploaded
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded." });
    }

    // 2) Log the received file details
    console.log("Received file:", req.file.originalname, "at", req.file.path);

    // 3) Create a unique filename and set a destination path with a folder prefix
    const localFilePath = req.file.path;
    const filename = `${Date.now()}_${req.file.originalname}`;
    const destinationPath = `resumes/${filename}`;

    // 4) Upload the file to GCS under the "resumes/" folder
    console.log("Uploading file to GCS with destination:", destinationPath);
    await bucket.upload(localFilePath, {
      destination: destinationPath,
      resumable: false,
    });
    console.log("File uploaded successfully to GCS.");

    // 5) Verify that the file exists in GCS
    const file = bucket.file(destinationPath);
    const [exists] = await file.exists();
    if (!exists) {
      console.error("File does not exist in GCS after upload.");
      return res.status(500).json({ success: false, error: "File upload failed." });
    }

    // 6) Delete the local file to free up space
    fs.unlink(localFilePath, (err) => {
      if (err) console.error("Error deleting local file:", err);
      else console.log("Local file deleted:", localFilePath);
    });

    // 7) Download the file from GCS into memory
    console.log("Downloading file from GCS...");
    const [fileData] = await file.download();
    console.log("File downloaded from GCS.");

    // 8) Encode the downloaded data as base64 for Document AI
    const base64Content = fileData.toString("base64");
    console.log("File encoded to base64.");

    // 9) Obtain a fresh access token using google-auth-library
    const auth = new GoogleAuth({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: "https://www.googleapis.com/auth/cloud-platform",
    });
    const accessToken = await auth.getAccessToken();
    console.log("Access token acquired.");

    // 10) Call Document AI API using the 'rawDocument' field with inline content
    console.log("Calling Document AI API...");
    const response = await axios.post(
      docAIProcessorURL,
      {
        rawDocument: {
          content: base64Content,
          mimeType: "application/pdf",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log("Document AI API response received.");

    // 11) Extract text from the API response
    const extractedText = response.data.document?.text || "No text extracted.";

    // 12) Store extracted text in session for future use (e.g., compare to job description)
    req.session.lastExtractedResume = extractedText;

    // 13) Return the extracted text as a JSON response
    return res.json({ success: true, text: extractedText });
  } catch (error) {
    console.error("Error processing resume:", error.response ? error.response.data : error);
    return res.status(500).json({ success: false, error: "Failed to process resume." });
  }
};
