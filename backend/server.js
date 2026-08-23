const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

// Validate required environment variables on startup
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === "production") {
    console.error("FATAL: JWT_SECRET environment variable is missing in production.");
    process.exit(1);
  } else {
    console.warn("WARNING: JWT_SECRET environment variable is not defined in development.");
  }
}

if (!process.env.MONGO_URI) {
  if (process.env.NODE_ENV === "production") {
    console.error("FATAL: MONGO_URI environment variable is missing in production.");
    process.exit(1);
  } else {
    console.warn("WARNING: MONGO_URI environment variable is not defined in development.");
  }
}

const app = express();

// #13 Dynamic CORS Configuration
const getAllowedOrigins = () => {
  if (process.env.ALLOWED_ORIGINS) {
    return process.env.ALLOWED_ORIGINS.split(",")
      .map((o) => o.trim())
      .filter(Boolean);
  }
  return [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://job-portal-1t8k.vercel.app",
    "https://job-portal-gamma-tan.vercel.app",
  ];
};

const allowedOrigins = getAllowedOrigins();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        (process.env.NODE_ENV !== "production" &&
          (origin.includes("localhost") || origin.includes("127.0.0.1")))
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS error: Origin ${origin} not allowed.`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// #14 Serverless MongoDB Connection Handling with Cache & Pre-request Middleware
let cachedDbPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI environment variable is missing.");
  }

  if (!cachedDbPromise) {
    cachedDbPromise = mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false,
    });
  }

  try {
    await cachedDbPromise;
    return mongoose.connection;
  } catch (err) {
    cachedDbPromise = null;
    throw err;
  }
};

// Middleware to ensure DB connection is active before routes execute
const ensureDbConnected = async (req, res, next) => {
  // Allow health check without blocking on DB
  if (req.path === "/health") return next();

  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database connection failure:", err.message);
    res.status(503).json({
      message: "Database connection failed. Please try again in a moment.",
    });
  }
};

app.use("/api", ensureDbConnected);

// Local static uploads fallback (for dev preview only)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/jobs", require("./routes/jobs"));
app.use("/api/applications", require("./routes/applications"));
app.use("/api/users", require("./routes/users"));
app.use("/api/ai", require("./routes/ai"));
app.use("/api/upload", require("./routes/upload"));

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Job Portal API is running",
    dbState: mongoose.connection.readyState,
  });
});

// 404 Handler for undefined API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Global Error Handler
app.use(require("./middleware/errorHandler"));

// Local development server listener
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;