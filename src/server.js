const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { testConnection } = require("./config/database");
require("dotenv").config();
const path = require("path");
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');


const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ✅ __dirname works automatically in CommonJS (no need for fileURLToPath)
const __dirnameResolved = __dirname;

app.use('/api/user', require('./routes/user'));
// ✅ Serve static files from /uploads folder
app.use("/uploads", express.static(path.join(__dirnameResolved, "../uploads")));

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Serve uploaded files
app.use("/uploads", express.static("uploads"));
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

// Logging (before routes)
app.use(
  morgan("combined", {
    skip: function (req, res) {
      return res.statusCode < 400 && process.env.NODE_ENV === "production";
    },
  })
);
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(` ${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
  });
}

/*
  ---- DO NOT USE express.json() or express.urlencoded() BEFORE FILE ROUTES ----
  Multer (used in registration route) will handle file/form-data parsing.
  JSON body parsing is added after file upload routes!
*/

// Main routes (file/form-data routes first, e.g. registration)
try {
  app.use("/api/registration", require("./routes/registration")); // includes file upload endpoints
  // Add JSON/body-parsing middleware only after above:
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // All other non-file routes
  app.use("/api/auth", require("./routes/auth"));
  app.use("/api/dashboard", require("./routes/dashboard"));
  app.use("/api/search", require("./routes/search"));
  app.use("/api/dutychart", require("./routes/dutychart"));
  app.use("/api/reports", require("./routes/reports"));
} catch (error) {
  console.error(" Error loading routes:", error.message);
  console.error("Make sure all route files exist in the routes/ directory");
}

// Health check endpoints
app.get("/health", (req, res) => {
  res.status(200).json({
    message: "SNM Dispensary Server is running!",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/api/health/db", async (req, res) => {
  const isConnected = await testConnection();
  res.status(isConnected ? 200 : 500).json({
    message: isConnected
      ? "SNM Dispensary Database connected"
      : "Database connection failed",
    database: "snm_dispensary",
    timestamp: new Date().toISOString(),
  });
});

// API overview
app.get("/api", (req, res) => {
  res.json({
    message: "SNM Dispensary API",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    endpoints: {
      authentication: "/api/auth",
      registration: "/api/registration",
      dashboard: "/api/dashboard",
      search: "/api/search",
      dutychart: "/api/dutychart",
      reports: "/api/reports",
      health: "/health",
      dbHealth: "/api/health/db",
    },
    status: "Active",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware (AFTER all routes)
app.use((err, req, res, next) => {
  console.error("🚨 Server Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use("*", (req, res) => {
  console.log(` 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: [
      "GET /api",
      "GET /health",
      "GET /api/health/db",
      "POST /api/auth/login",
      "POST /api/auth/forgot-password",
      "POST /api/registration/register",
      "GET /api/dashboard/stats",
      "GET /api/search/master-search",
      "GET /api/dutychart/filter",
      "GET /api/reports/daily",
      "GET /api/reports/registration",
      "GET /api/reports/master",
    ],
    timestamp: new Date().toISOString(),
  });
});

// Start server/check DB
const startServer = async () => {
  const dbConnected = await testConnection();
  if (dbConnected) {
    app.listen(PORT, () => {
      console.log(` Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`   • Health: http://localhost:${PORT}/health`);
      console.log(`   • API Overview: http://localhost:${PORT}/api`)
      console.log(`   • Swagger UI: http://localhost:${PORT}/api-docs`);
    });
  } else {
    console.error(
      " Failed to connect to snm_dispensary database. Server not started."
    );
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n Received SIGINT. Gracefully shutting down...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\nReceived SIGTERM. Gracefully shutting down...");
  process.exit(0);
});

startServer();
