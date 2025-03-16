// controllers/compareController.js
const axios = require("axios");

exports.compareResumeWithJob = async (req, res) => {
  try {
    // Retrieve the extracted resume text and job description from session
    const resumeText = req.session.lastExtractedResume || "";
    const jobDescription = req.session.lastJobDescription || "";

    // Validate that both resume and job description are available
    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        success: false,
        error: "Missing resume text or job description. Please ensure both are uploaded."
      });
    }

    console.log("Comparing resume with job description...");

    // Call the OpenAI API (using GPT-3.5-turbo for cost efficiency)
    const aiResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an AI resume evaluator. Compare a resume with a job description and provide a similarity score (out of 100), list missing skills, and offer concise improvement suggestions."
          },
          {
            role: "user",
            content: `Job Description:\n${jobDescription}\n\nResume:\n${resumeText}\n\nPlease provide your analysis in the following format:\n- Resume Score (out of 100):\n- Missing Skills:\n- Improvement Suggestions:`
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    // Extract the analysis text from the API response
    const analysis =
      aiResponse.data?.choices?.[0]?.message?.content || "No analysis generated.";

    console.log("AI comparison analysis received.");

    return res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error(
      "Error comparing resume and job description:",
      error.response ? error.response.data : error
    );
    return res.status(500).json({
      success: false,
      error: "Failed to compare resume with job description."
    });
  }
};
