// src/components/UploadJob.jsx
import React, { useState } from "react";

const UploadJob = () => {
  const [message, setMessage] = useState("");
  const [jobText, setJobText] = useState("");

  // Handle text-based job description upload
  const handleJobTextUpload = async (e) => {
    e.preventDefault();
    const text = e.target.elements.jobDescription.value;
    if (!text) {
      setMessage("Please enter a job description.");
      return;
    }
    try {
      const response = await fetch("https://resume-analyser-589433582692.us-central1.run.app/api/job/upload-text", {
        method: "POST",
        credentials: "include", // send cookies for session
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: text }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage("Job description text uploaded successfully!");
        setJobText(text);
      } else {
        setMessage("Error: " + data.error);
      }
    } catch (error) {
      console.error("Error uploading job text:", error);
      setMessage("Error uploading job text.");
    }
  };

  // Handle file-based job description upload
  const handleJobFileUpload = async (e) => {
    e.preventDefault();
    const fileInput = e.target.elements.jobFile;
    if (fileInput.files.length === 0) {
      setMessage("Please select a job description file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("jobFile", fileInput.files[0]);

    try {
      const response = await fetch("https://resume-analyser-589433582692.us-central1.run.app/api/job/upload-file", {
        method: "POST",
        credentials: "include", // ensure cookies are sent
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setMessage("Job description file uploaded and processed successfully!");
        setJobText(data.jobText);
      } else {
        setMessage("Error: " + data.error);
      }
    } catch (error) {
      console.error("Error uploading job file:", error);
      setMessage("Error uploading job file.");
    }
  };

  return (
    <div className="p-4 border rounded-md shadow-md bg-white mt-6">
      <h2 className="text-xl font-semibold mb-2">Upload Job Description</h2>

      <div className="mb-4">
        <h3 className="font-medium">Upload as Text</h3>
        <form onSubmit={handleJobTextUpload}>
          <textarea
            name="jobDescription"
            rows="5"
            className="w-full p-2 border rounded"
            placeholder="Paste job description here..."
          ></textarea>
          <button type="submit" className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            Submit Job Description Text
          </button>
        </form>
      </div>

      <div>
        <h3 className="font-medium">Upload as File</h3>
        <form onSubmit={handleJobFileUpload}>
          <input type="file" name="jobFile" accept=".pdf,.doc,.docx" className="mb-2 p-1 border" />
          <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            Upload Job Description File
          </button>
        </form>
      </div>

      {message && <p className="mt-2 text-sm">{message}</p>}
      {jobText && (
        <div className="mt-4">
          <h3 className="font-semibold">Job Description Extracted Text:</h3>
          <pre className="whitespace-pre-wrap text-xs p-2 bg-gray-100 border rounded">{jobText}</pre>
        </div>
      )}
    </div>
  );
};

export default UploadJob;
