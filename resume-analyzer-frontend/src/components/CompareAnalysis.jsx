// src/components/CompareAnalysis.jsx
import React, { useState } from "react";

const CompareAnalysis = () => {
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCompare = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("https://resume-analyser-589433582692.us-central1.run.app/api/compare", {
        method: "POST",
        // credentials: "include", // include cookies so session data is available
      });
      const data = await response.json();
      if (data.success) {
        setAnalysis(data.analysis);
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error("Error comparing resume and job description:", err);
      setError("Error comparing resume and job description.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-md shadow-md bg-white mt-6">
      <h2 className="text-xl font-semibold mb-2">Compare Resume & Job Description</h2>
      <button
        onClick={handleCompare}
        disabled={loading}
        className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
      >
        {loading ? "Comparing..." : "Compare Now"}
      </button>
      {error && <p className="mt-2 text-red-600">{error}</p>}
      {analysis && (
        <div className="mt-4">
          <h3 className="font-semibold">Comparison Analysis:</h3>
          <pre className="whitespace-pre-wrap text-xs p-2 bg-gray-100 border rounded">{analysis}</pre>
        </div>
      )}
    </div>
  );
};

export default CompareAnalysis;
