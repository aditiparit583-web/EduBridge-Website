const express = require("express");
const mongoose = require("mongoose");
const Mark = require("../models/Mark");
const Student = require("../models/Student");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

const escapeRegex = (value) =>
  String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function staffOnly(req, res, next) {
  if (!req.user || !["Admin", "Teacher"].includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied" });
  }

  next();
}

function calculateGrade(percentage) {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  return "F";
}

async function getLinkedStudents(user) {
  if (user.role === "Student") {
    return Student.find({
      email: String(user.email || "").trim().toLowerCase()
    });
  }

  if (user.role === "Parent") {
    return Student.find({
      parentEmail: String(user.email || "").trim().toLowerCase()
    });
  }

  return [];
}

// तपासणी: route handlers functions आहेत का?
console.log("MARK ROUTES CHECK:", {
  authMiddleware: typeof authMiddleware,
  staffOnly: typeof staffOnly
});

// Parent आणि Student यांना स्वतःचा संबंधित marks data
router.get("/parent", authMiddleware, async (req, res) => {
  try {
    if (!["Parent", "Student"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const students = await getLinkedStudents(req.user);

    if (!students.length) {
      return res.json({
        marks: [],
        message: "No student is linked to this account"
      });
    }

    const ids = students.map((student) => student._id);
    const names = students.map((student) => student.name);

    const marks = await Mark.find({
      $or: [
        { studentId: { $in: ids } },
        { studentName: { $in: names } }
      ]
    }).sort({ createdAt: -1 });

    return res.json({ marks });
  } catch (error) {
    console.error("Parent marks error:", error);
    return res.status(500).json({
      message: "Failed to fetch marks"
    });
  }
});

// Admin आणि Teacher सर्व marks पाहू शकतात
router.get("/", authMiddleware, staffOnly, async (req, res) => {
  try {
    const marks = await Mark.find().sort({ createdAt: -1 });
    return res.json(marks);
  } catch (error) {
    console.error("Marks fetch error:", error);
    return res.status(500).json({
      message: "Failed to fetch marks"
    });
  }
});

// एका mark ची माहिती
router.get("/:id", authMiddleware, staffOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid mark ID" });
    }

    const mark = await Mark.findById(req.params.id);

    if (!mark) {
      return res.status(404).json({ message: "Mark not found" });
    }

    return res.json(mark);
  } catch (error) {
    console.error("Mark fetch error:", error);
    return res.status(500).json({
      message: "Failed to fetch mark"
    });
  }
});

// नवीन mark तयार करणे
router.post("/", authMiddleware, staffOnly, async (req, res) => {
  try {
    const {
      studentId,
      studentName,
      examName,
      subject,
      totalMarks,
      obtainedMarks,
      remarks
    } = req.body;

    if (
      !studentName?.trim() ||
      !examName?.trim() ||
      !subject?.trim() ||
      totalMarks === undefined ||
      obtainedMarks === undefined
    ) {
      return res.status(400).json({
        message: "Required mark fields are missing"
      });
    }

    const total = Number(totalMarks);
    const obtained = Number(obtainedMarks);

    if (
      !Number.isFinite(total) ||
      !Number.isFinite(obtained) ||
      total <= 0 ||
      obtained < 0 ||
      obtained > total
    ) {
      return res.status(400).json({ message: "Invalid marks" });
    }

    let student = null;

    if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
      student = await Student.findById(studentId);
    }

    if (!student) {
      student = await Student.findOne({
        name: {
          $regex: "^" + escapeRegex(studentName.trim()) + "$",
          $options: "i"
        }
      });
    }

    const percentage = Number(((obtained / total) * 100).toFixed(2));

    const mark = await Mark.create({
      studentId: student?._id || null,
      studentName: student?.name || studentName.trim(),
      examName: examName.trim(),
      subject: subject.trim(),
      totalMarks: total,
      obtainedMarks: obtained,
      percentage,
      grade: calculateGrade(percentage),
      remarks: remarks || ""
    });

    return res.status(201).json(mark);
  } catch (error) {
    console.error("Mark create error:", error);
    return res.status(500).json({
      message: "Failed to create mark"
    });
  }
});

// Mark update करणे
router.put("/:id", authMiddleware, staffOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid mark ID" });
    }

    const {
      studentId,
      studentName,
      examName,
      subject,
      totalMarks,
      obtainedMarks,
      remarks
    } = req.body;

    const total = Number(totalMarks);
    const obtained = Number(obtainedMarks);

    if (
      !studentName?.trim() ||
      !examName?.trim() ||
      !subject?.trim() ||
      !Number.isFinite(total) ||
      !Number.isFinite(obtained) ||
      total <= 0 ||
      obtained < 0 ||
      obtained > total
    ) {
      return res.status(400).json({
        message: "Invalid mark details"
      });
    }

    let student = null;

    if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
      student = await Student.findById(studentId);
    }

    if (!student) {
      student = await Student.findOne({
        name: {
          $regex: "^" + escapeRegex(studentName.trim()) + "$",
          $options: "i"
        }
      });
    }

    const percentage = Number(((obtained / total) * 100).toFixed(2));

    const mark = await Mark.findByIdAndUpdate(
      req.params.id,
      {
        studentId: student?._id || null,
        studentName: student?.name || studentName.trim(),
        examName: examName.trim(),
        subject: subject.trim(),
        totalMarks: total,
        obtainedMarks: obtained,
        percentage,
        grade: calculateGrade(percentage),
        remarks: remarks || ""
      },
      { new: true, runValidators: true }
    );

    if (!mark) {
      return res.status(404).json({ message: "Mark not found" });
    }

    return res.json(mark);
  } catch (error) {
    console.error("Mark update error:", error);
    return res.status(500).json({
      message: "Failed to update mark"
    });
  }
});

// Mark delete करणे
router.delete("/:id", authMiddleware, staffOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid mark ID" });
    }

    const mark = await Mark.findByIdAndDelete(req.params.id);

    if (!mark) {
      return res.status(404).json({ message: "Mark not found" });
    }

    return res.json({ message: "Mark deleted successfully" });
  } catch (error) {
    console.error("Mark delete error:", error);
    return res.status(500).json({
      message: "Failed to delete mark"
    });
  }
});

module.exports = router;