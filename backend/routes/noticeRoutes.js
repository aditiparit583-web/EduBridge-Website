const express = require("express");
const mongoose = require("mongoose");
const Notice = require("../models/Notice");
const Student = require("../models/Student");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();
const escapeRegex = value =>
  String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function staffOnly(req, res, next) {
  if (!["Admin", "Teacher"].includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied" });
  }

  next();
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

router.get("/", authMiddleware, async (req, res) => {
  try {
    if (["Admin", "Teacher"].includes(req.user.role)) {
      return res.json(await Notice.find().sort({ noticeDate: -1 }));
    }

    if (!["Parent", "Student"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const students = await getLinkedStudents(req.user);

    if (!students.length) {
      return res.json([]);
    }

    const audienceRules = [
      { audience: "All" },
      { audience: "Parents" }
    ];

    const targetRules = [
      { targetType: { $exists: false } },
      { targetType: null },
      { targetType: "General" }
    ];

    for (const student of students) {
      if (student.course) {
        targetRules.push({
          targetType: "Course",
          course: {
            $regex: "^" + escapeRegex(student.course) + "$",
            $options: "i"
          }
        });
      }

      if (student.course && student.batch) {
        targetRules.push({
          targetType: "Batch",
          course: {
            $regex: "^" + escapeRegex(student.course) + "$",
            $options: "i"
          },
          batch: {
            $regex: "^" + escapeRegex(student.batch) + "$",
            $options: "i"
          }
        });
      }

      targetRules.push({
        targetType: "Individual",
        studentId: student._id
      });
    }

    const notices = await Notice.find({
      status:"Active",
      $and: [
        { $or: audienceRules },
        { $or: targetRules }
      ]
    }).sort({ noticeDate: -1, createdAt: -1 });

    return res.json(notices);
  } catch (error) {
    console.error("Notice fetch error:", error);
    return res.status(500).json({
      message: "Failed to fetch notices"
    });
  }
});

router.post("/", authMiddleware, staffOnly, async (req, res) => {
  try {
    const {
      title,
      message,
      noticeDate,
      audience = "All",
      targetType = "General",
      course = "",
      batch = "",
      studentId = null
    } = req.body;

    if (!title?.trim() || !message?.trim() || !noticeDate) {
      return res.status(400).json({
        message: "Title, message and notice date are required"
      });
    }

    if (
      !["All", "Students", "Teachers", "Parents"].includes(audience)
    ) {
      return res.status(400).json({ message: "Invalid audience" });
    }

    if (
      !["General", "Course", "Batch", "Individual"].includes(targetType)
    ) {
      return res.status(400).json({ message: "Invalid target type" });
    }

    if (targetType === "Individual") {
      if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
        return res.status(400).json({
          message: "Valid studentId is required"
        });
      }

      const student = await Student.findById(studentId);

      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
    }

    const notice = await Notice.create({
      title: title.trim(),
      message: message.trim(),
      noticeDate,
      audience,
      targetType,
      course,
      batch,
      studentId: targetType === "Individual" ? studentId : null
    });

    return res.status(201).json(notice);
  } catch (error) {
    console.error("Notice create error:", error);
    return res.status(500).json({
      message: "Failed to create notice"
    });
  }
});

router.put("/:id", authMiddleware, staffOnly, async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    return res.json(notice);
  } catch (error) {
    console.error("Notice update error:", error);
    return res.status(500).json({
      message: "Failed to update notice"
    });
  }
});

router.delete("/:id", authMiddleware, staffOnly, async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);

    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    return res.json({ message: "Notice deleted successfully" });
  } catch (error) {
    console.error("Notice delete error:", error);
    return res.status(500).json({
      message: "Failed to delete notice"
    });
  }
});

module.exports = router;