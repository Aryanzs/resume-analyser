// server.js
const express = require("express");
const session = require("express-session");
const cors = require("cors");

require("dotenv").config();

const resumeRoutes = require("./routes/resumeRoutes");
const jobRoutes = require("./routes/jobRoutes");
const compareRoutes = require("./routes/compareRoutes");

const app = express();

// Configure CORS to allow requests from your frontend
app.use(
    cors({
      origin: "http://localhost:5173", // Update if your frontend is hosted elsewhere
      credentials: true, // Allow cookies to be sent
    })
  );

// Parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up session middleware (for storing extracted texts and job description)
app.use(
  session({
    secret: "resume-analyzer-secret",
    resave: false,
    saveUninitialized: true,
  })
);

// Mount the routes
app.use("/api/resume", resumeRoutes);
app.use("/api/job", jobRoutes);
app.use("/api/compare", compareRoutes);

const PORT = 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
