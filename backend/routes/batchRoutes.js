const express = require("express");
const mongoose = require("mongoose");

const Batch = require("../models/Batch");
const {
  authMiddleware,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

const normalize = (value) =>
  String(value || "").trim().toLowerCase();

// Get batches
router.get("/", authMiddleware, async (req, res) => {
  try {
    let batches;

    if (req.user.role === "Admin") {
      batches = await Batch.find().sort({ createdAt: -1 });
    } else if (req.user.role === "Teacher") {
      batches = await Batch.find({
        teacherName: {
          $regex: `^${req.user.name.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          )}$`,
          $options: "i",
        },
      }).sort({ createdAt: -1 });
    } else {
      return res.status(403).json({
        message: "You are not authorized to view batches.",
      });
    }

    return res.status(200).json(batches);
  } catch (error) {
    console.error("Get batches error:", error.message);

    return res.status(500).json({
      message: "Server error while fetching batches.",
    });
  }
});

// Get a single batch
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid batch ID.",
      });
    }

    const batch = await Batch.findById(id);

    if (!batch) {
      return res.status(404).json({
        message: "Batch not found.",
      });
    }

    if (
      req.user.role !== "Admin" &&
      !(
        req.user.role === "Teacher" &&
        normalize(batch.teacherName) === normalize(req.user.name)
      )
    ) {
      return res.status(403).json({
        message: "You are not authorized to view this batch.",
      });
    }

    return res.status(200).json(batch);
  } catch (error) {
    console.error("Get batch error:", error.message);

    return res.status(500).json({
      message: "Server error while fetching batch.",
    });
  }
});

// Create a batch - Admin only
router.post("/", authMiddleware, adminOnly, async (req, res) => {
  try {
    const {
      name,
      course,
      subject,
      teacherName,
      timetable,
      capacity,
      status,
    } = req.body;

    if (
      !name?.trim() ||
      !course?.trim() ||
      !subject?.trim() ||
      !teacherName?.trim() ||
      !timetable?.trim() ||
      capacity === undefined ||
      capacity === null ||
      capacity === ""
    ) {
      return res.status(400).json({
        message: "All required batch fields must be provided.",
      });
    }

    const numericCapacity = Number(capacity);

    if (
      !Number.isInteger(numericCapacity) ||
      numericCapacity < 1
    ) {
      return res.status(400).json({
        message: "Capacity must be a positive whole number.",
      });
    }

    if (
      status !== undefined &&
      !["Active", "Inactive"].includes(status)
    ) {
      return res.status(400).json({
        message: "Status must be Active or Inactive.",
      });
    }

    const batch = await Batch.create({
      name: name.trim(),
      course: course.trim(),
      subject: subject.trim(),
      teacherName: teacherName.trim(),
      timetable: timetable.trim(),
      capacity: numericCapacity,
      status: status || "Active",
    });

    return res.status(201).json({
      message: "Batch added successfully.",
      batch,
    });
  } catch (error) {
    console.error("Add batch error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "A batch with these details already exists.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Server error while adding batch.",
    });
  }
});

// Update a batch - Admin only
router.put("/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid batch ID.",
      });
    }

    const allowedFields = [
      "name",
      "course",
      "subject",
      "teacherName",
      "timetable",
      "capacity",
      "status",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid fields provided for update.",
      });
    }

    for (const field of [
      "name",
      "course",
      "subject",
      "teacherName",
      "timetable",
    ]) {
      if (updates[field] !== undefined) {
        if (
          typeof updates[field] !== "string" ||
          !updates[field].trim()
        ) {
          return res.status(400).json({
            message: `${field} must be a non-empty string.`,
          });
        }

        updates[field] = updates[field].trim();
      }
    }

    if (updates.capacity !== undefined) {
      const numericCapacity = Number(updates.capacity);

      if (
        !Number.isInteger(numericCapacity) ||
        numericCapacity < 1
      ) {
        return res.status(400).json({
          message: "Capacity must be a positive whole number.",
        });
      }

      updates.capacity = numericCapacity;
    }

    if (
      updates.status !== undefined &&
      !["Active", "Inactive"].includes(updates.status)
    ) {
      return res.status(400).json({
        message: "Status must be Active or Inactive.",
      });
    }

    const batch = await Batch.findByIdAndUpdate(
      id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!batch) {
      return res.status(404).json({
        message: "Batch not found.",
      });
    }

    return res.status(200).json({
      message: "Batch updated successfully.",
      batch,
    });
  } catch (error) {
    console.error("Update batch error:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Server error while updating batch.",
    });
  }
});

// Delete a batch - Admin only
router.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid batch ID.",
      });
    }

    const batch = await Batch.findByIdAndDelete(id);

    if (!batch) {
      return res.status(404).json({
        message: "Batch not found.",
      });
    }

    return res.status(200).json({
      message: "Batch deleted successfully.",
    });
  } catch (error) {
    console.error("Delete batch error:", error.message);

    return res.status(500).json({
      message: "Server error while deleting batch.",
    });
  }
});

module.exports = router;