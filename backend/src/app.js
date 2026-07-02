require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const employeeRoutes = require("./routes/employee.routes");
const managerRoutes = require("./routes/manager.routes");
const hrRoutes = require("./routes/hr.routes");
const goalRoutes = require("./routes/goal.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const reviewRoutes = require("./routes/review.routes");
const reportRoutes = require("./routes/report.routes");
const aiRoutes = require("./routes/ai.routes");
const leaveRoutes = require("./routes/leave.routes");
const discussionRoutes = require("./routes/discussion.routes");
const jiraRoutes = require("./routes/jira.routes");

const app = express();

// ================= Middleware =================

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:4173",
    "http://127.0.0.1:5173",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(helmet());

app.use(morgan("dev"));

app.use(cookieParser());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// ================= Health Check =================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "PMS Backend Running",
    version: "1.0.0",
  });
});

// ================= API Routes =================

app.use("/api/auth", authRoutes);

app.use("/api/employee", employeeRoutes);

app.use("/api/manager", managerRoutes);

app.use("/api/hr", hrRoutes);

app.use("/api/goals", goalRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/reviews", reviewRoutes);

app.use("/api/reports", reportRoutes);

app.use("/api/ai", aiRoutes);

app.use("/api/leave", leaveRoutes);

app.use("/api/discussions", discussionRoutes);

app.use("/api/jira", jiraRoutes);

// ================= 404 =================
// Express 5 Compatible

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API Route Not Found",
  });
});

// ================= Error Handler =================

app.use((err, req, res, next) => {

  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });

});

module.exports = app;