const express = require("express");
const mongoose = require("mongoose");
const StudyMaterial = require("../models/StudyMaterial");
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
      return res.json(await StudyMaterial.find().sort({ createdAt: -1 }));
    }

    if (!["Parent", "Student"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const students = await getLinkedStudents(req.user);

    if (!students.length) {
      return res.json([]);
    }

    const courses = [...new Set(students.map(s => s.course).filter(Boolean))];
    const batches = [...new Set(students.map(s => s.batch).filter(Boolean))];

    const courseRules = courses.map(course => ({
      course: {
        $regex: "^" + escapeRegex(course) + "$",
        $options: "i"
      }
    }));

    if (!courseRules.length) {
      return res.json([]);
    }

    const batchRules = [
      { batch: { $exists: false } },
      { batch: null },
      { batch: "" },
      ...batches.map(batch => ({
        batch: {
          $regex: "^" + escapeRegex(batch) + "$",
          $options: "i"
        }
      }))
    ];

    const materials = await StudyMaterial.find({
      status:"Active",
      $and: [
        { $or: courseRules },
        { $or: batchRules }
      ]
    }).sort({ createdAt: -1 });

    return res.json(materials);
  } catch (error) {
    console.error("Study material fetch error:", error);
    return res.status(500).json({
      message: "Failed to fetch study materials"
    });
  }
});

router.post("/", authMiddleware, staffOnly, async (req, res) => {
  try {
    const {
      title,
      subject,
      course,
      batch,
      materialType,
      description,
      materialLink
    } = req.body;

    if (!title?.trim() || !subject?.trim() || !course?.trim()) {
      return res.status(400).json({
        message: "Title, subject and course are required"
      });
    }

    const material = await StudyMaterial.create({
      title: title.trim(),
      subject: subject.trim(),
      course: course.trim(),
      batch: batch || "",
      materialType: materialType || "Notes",
      description: description || "",
      materialLink: materialLink || ""
    });

    return res.status(201).json(material);
  } catch (error) {
    console.error("Study material create error:", error);
    return res.status(500).json({
      message: "Failed to create study material"
    });
  }
});

router.put("/:id", authMiddleware, staffOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid material ID" });
    }

    const material = await StudyMaterial.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    return res.json(material);
  } catch (error) {
    console.error("Study material update error:", error);
    return res.status(500).json({
      message: "Failed to update study material"
    });
  }
});

router.delete("/:id", authMiddleware, staffOnly, async (req, res) => {
  try {
    const material = await StudyMaterial.findByIdAndDelete(req.params.id);

    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    return res.json({ message: "Study material deleted successfully" });
  } catch (error) {
    console.error("Study material delete error:", error);
    return res.status(500).json({
      message: "Failed to delete study material"
    });
  }
});

module.exports = router;