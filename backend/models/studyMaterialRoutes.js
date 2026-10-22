const express = require("express");
const StudyMaterial = require("../models/StudyMaterial");

const router = express.Router();

// Get all study materials
router.get("/", async (req, res) => {
  try {
    const materials = await StudyMaterial.find().sort({ createdAt: -1 });

    res.status(200).json(materials);
  } catch (error) {
    console.error("Get study materials error:", error.message);

    res.status(500).json({
      message: "Server error while fetching study materials",
    });
  }
});

// Get single study material
router.get("/:id", async (req, res) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        message: "Study material not found",
      });
    }

    res.status(200).json(material);
  } catch (error) {
    console.error("Get study material error:", error.message);

    res.status(500).json({
      message: "Server error while fetching study material",
    });
  }
});

// Add study material
router.post("/", async (req, res) => {
  try {
    const {
      title,
      subject,
      course,
      materialType,
      description,
      materialLink,
      status,
    } = req.body;

    if (!title || !subject || !course) {
      return res.status(400).json({
        message: "Title, subject and course are required",
      });
    }

    const material = await StudyMaterial.create({
      title,
      subject,
      course,
      materialType,
      description,
      materialLink,
      status,
    });

    res.status(201).json({
      message: "Study material added successfully",
      material,
    });
  } catch (error) {
    console.error("Add study material error:", error.message);

    res.status(500).json({
      message: "Server error while adding study material",
    });
  }
});

// Update study material
router.put("/:id", async (req, res) => {
  try {
    const {
      title,
      subject,
      course,
      materialType,
      description,
      materialLink,
      status,
    } = req.body;

    const material = await StudyMaterial.findByIdAndUpdate(
      req.params.id,
      {
        title,
        subject,
        course,
        materialType,
        description,
        materialLink,
        status,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!material) {
      return res.status(404).json({
        message: "Study material not found",
      });
    }

    res.status(200).json({
      message: "Study material updated successfully",
      material,
    });
  } catch (error) {
    console.error("Update study material error:", error.message);

    res.status(500).json({
      message: "Server error while updating study material",
    });
  }
});

// Delete study material
router.delete("/:id", async (req, res) => {
  try {
    const material = await StudyMaterial.findByIdAndDelete(req.params.id);

    if (!material) {
      return res.status(404).json({
        message: "Study material not found",
      });
    }

    res.status(200).json({
      message: "Study material deleted successfully",
    });
  } catch (error) {
    console.error("Delete study material error:", error.message);

    res.status(500).json({
      message: "Server error while deleting study material",
    });
  }
});

module.exports = router;