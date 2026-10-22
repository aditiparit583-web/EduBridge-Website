const express = require("express");
const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

function staffOnly(req, res, next) {
  if (!req.user || !["Admin", "Teacher"].includes(req.user.role)) {
    return res.status(403).json({
      message: "Access denied. Only administrators and teachers are allowed.",
    });
  }

  next();
}

// Get attendance records
router.get("/", authMiddleware, async (req, res) => {
  try {
    if (!["Admin", "Teacher"].includes(req.user.role)) {
      return res.status(403).json({
        message: "You are not authorized to view all attendance records.",
      });
    }

    const records = await Attendance.find().sort({ date: -1 });

    return res.status(200).json(records);
  } catch (error) {
    console.error("Get attendance error:", error.message);

    return res.status(500).json({
      message: "Failed to retrieve attendance records.",
    });
  }
});

// Get attendance records for the logged-in student or parent
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const role = req.user.role;

    if (!["Student", "Parent"].includes(role)) {
      return res.status(403).json({
        message: "This endpoint is available only to students and parents.",
      });
    }

    const email = String(req.user.email || "").trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        message: "The logged-in account does not have an email address.",
      });
    }

    const studentQuery =
      role === "Student"
        ? { email }
        : { parentEmail: email };

    const students = await Student.find(studentQuery).select("name");

    if (students.length === 0) {
      return res.status(200).json([]);
    }

    const studentNames = students
      .map((student) => student.name)
      .filter(Boolean);

    const records = await Attendance.find({
      studentName: { $in: studentNames },
    }).sort({ date: -1 });

    return res.status(200).json(records);
  } catch (error) {
    console.error("Get personal attendance error:", error.message);

    return res.status(500).json({
      message: "Failed to retrieve your attendance records.",
    });
  }
});

// Add an attendance record
router.post("/", authMiddleware, staffOnly, async (req, res) => {
  try {
    const { studentName, date, status, remarks } = req.body;

    if (!studentName || !date || !status) {
      return res.status(400).json({
        message: "Student name, date, and status are required.",
      });
    }

    const record = await Attendance.create({
      studentName: studentName.trim(),
      date,
      status,
      remarks: remarks || "",
    });

    return res.status(201).json(record);
  } catch (error) {
    console.error("Create attendance error:", error.message);

    return res.status(500).json({
      message: "Failed to create the attendance record.",
    });
  }
});

// Update an attendance record
router.put("/:id", authMiddleware, staffOnly, async (req, res) => {
  try {
    const record = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!record) {
      return res.status(404).json({
        message: "Attendance record not found.",
      });
    }

    return res.status(200).json(record);
  } catch (error) {
    console.error("Update attendance error:", error.message);

    return res.status(500).json({
      message: "Failed to update the attendance record.",
    });
  }
});

// Delete an attendance record
router.delete("/:id", authMiddleware, staffOnly, async (req, res) => {
  try {
    const record = await Attendance.findByIdAndDelete(req.params.id);

    if (!record) {
      return res.status(404).json({
        message: "Attendance record not found.",
      });
    }

    return res.status(200).json({
      message: "Attendance record deleted successfully.",
    });
  } catch (error) {
    console.error("Delete attendance error:", error.message);

    return res.status(500).json({
      message: "Failed to delete the attendance record.",
    });
  }
});

module.exports = router;