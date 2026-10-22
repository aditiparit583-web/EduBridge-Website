const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const batchRoutes = require("./routes/batchRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const feeRoutes = require("./routes/feeRoutes");
const examRoutes = require("./routes/examRoutes");
const markRoutes = require("./routes/markRoutes");
const studyMaterialRoutes = require("./routes/studyMaterialRoutes");
const noticeRoutes = require("./routes/noticeRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// प्रत्येक request Terminal मध्ये दाखवण्यासाठी
app.use((req, res, next) => {
  console.log(
    `[REQUEST] ${new Date().toLocaleTimeString()} ${req.method} ${req.originalUrl}`
  );
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/marks", markRoutes);
app.use("/api/study-materials", studyMaterialRoutes);
app.use("/api/notices", noticeRoutes);

// Home route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Coaching Tuition API is running successfully!",
  });
});

// Unknown route
app.use((req, res) => {
  res.status(404).json({
    message: "API route not found.",
    path: req.originalUrl,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    message: "Internal server error.",
  });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");
    console.log("AUTH ROUTES LOADED:", typeof authRoutes);
    console.log("SERVER FILE:", __filename);

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });