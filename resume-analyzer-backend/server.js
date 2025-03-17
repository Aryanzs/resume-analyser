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
// Define allowed origins dynamically from environment variables
const allowedOrigins = [
  "http://localhost:5173",  // For local development
  "https://genairesume.vercel.app", // Your deployed frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies and session data
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
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
