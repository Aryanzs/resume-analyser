// src/App.jsx
import React from "react";
import UploadResume from "./components/UploadResume";
import UploadJob from "./components/UploadJob";
import CompareAnalysis from "./components/CompareAnalysis";

const App = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Smart Resume Analyzer</h1>
        <p className="text-center mb-8">Upload your resume and job description to get an AI-driven analysis!</p>
        <div className="space-y-8">
          <UploadResume />
          <UploadJob />
          <CompareAnalysis />
        </div>
      </div>
    </div>
  );
};

export default App;
