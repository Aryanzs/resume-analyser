// src/components/UploadResume.jsx
import React, { useState } from "react";

const UploadResume = () => {
  const [message, setMessage] = useState("");
  const [extractedText, setExtractedText] = useState("");

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    const fileInput = e.target.elements.resume;
    if (fileInput.files.length === 0) {
      setMessage("Please select a resume file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("resume", fileInput.files[0]);

    try {
      const response = await fetch("http://localhost:5000/api/resume/upload", {
        method: "POST",
        credentials: "include", // include cookies for session persistence
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setMessage("Resume uploaded and processed successfully!");
        setExtractedText(data.text);
      } else {
        setMessage("Error: " + data.error);
      }
    } catch (error) {
      console.error("Error uploading resume:", error);
      setMessage("Error uploading resume.");
    }
  };

  return (
    <div className="p-4 border rounded-md shadow-md bg-white">
      <h2 className="text-xl font-semibold mb-2">Upload Resume</h2>
      <form onSubmit={handleResumeUpload}>
        <input type="file" name="resume" accept="application/pdf" className="mb-2 p-1 border" />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Upload Resume
        </button>
      </form>
      {message && <p className="mt-2 text-sm">{message}</p>}
      {extractedText && (
        <div className="mt-4">
          <h3 className="font-semibold">Extracted Resume Text:</h3>
          <pre className="whitespace-pre-wrap text-xs p-2 bg-gray-100 border rounded">{extractedText}</pre>
        </div>
      )}
    </div>
  );
};

export default UploadResume;
