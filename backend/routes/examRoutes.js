const express = require("express");
const Exam = require("../models/Exam");

const router = express.Router();

// GET all exams
router.get("/", async (req, res) => {
  try {
    const exams = await Exam.find().sort({ createdAt: -1 });

    res.status(200).json(exams);
  } catch (error) {
    console.error("Get exams error:", error.message);

    res.status(500).json({
      message: "Server error while fetching exams",
    });
  }
});

// GET single exam
router.get("/:id", async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        message: "Exam not found",
      });
    }

    res.status(200).json(exam);
  } catch (error) {
    console.error("Get exam error:", error.message);

    res.status(500).json({
      message: "Server error while fetching exam",
    });
  }
});

// POST - Add exam
router.post("/", async (req, res) => {
  try {
    const {
      examName,
      subject,
      course,
      examDate,
      totalMarks,
      passingMarks,
      description,
      status,
    } = req.body;

    if (
      !examName ||
      !subject ||
      !course ||
      !examDate ||
      totalMarks === undefined ||
      passingMarks === undefined
    ) {
      return res.status(400).json({
        message:
          "Exam name, subject, course, exam date, total marks and passing marks are required",
      });
    }

    const total = Number(totalMarks);
    const passing = Number(passingMarks);

    if (Number.isNaN(total) || Number.isNaN(passing)) {
      return res.status(400).json({
        message: "Total marks and passing marks must be numbers",
      });
    }

    if (passing > total) {
      return res.status(400).json({
        message: "Passing marks cannot be greater than total marks",
      });
    }

    const exam = await Exam.create({
      examName,
      subject,
      course,
      examDate,
      totalMarks: total,
      passingMarks: passing,
      description,
      status,
    });

    res.status(201).json({
      message: "Exam added successfully",
      exam,
    });
  } catch (error) {
    console.error("Add exam error:", error.message);

    res.status(500).json({
      message: "Server error while adding exam",
    });
  }
});

// PUT - Update exam
router.put("/:id", async (req, res) => {
  try {
    const {
      examName,
      subject,
      course,
      examDate,
      totalMarks,
      passingMarks,
      description,
      status,
    } = req.body;

    const total = Number(totalMarks);
    const passing = Number(passingMarks);

    if (Number.isNaN(total) || Number.isNaN(passing)) {
      return res.status(400).json({
        message: "Total marks and passing marks must be numbers",
      });
    }

    if (passing > total) {
      return res.status(400).json({
        message: "Passing marks cannot be greater than total marks",
      });
    }

    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      {
        examName,
        subject,
        course,
        examDate,
        totalMarks: total,
        passingMarks: passing,
        description,
        status,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!exam) {
      return res.status(404).json({
        message: "Exam not found",
      });
    }

    res.status(200).json({
      message: "Exam updated successfully",
      exam,
    });
  } catch (error) {
    console.error("Update exam error:", error.message);

    res.status(500).json({
      message: "Server error while updating exam",
    });
  }
});

// DELETE - Delete exam
router.delete("/:id", async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);

    if (!exam) {
      return res.status(404).json({
        message: "Exam not found",
      });
    }

    res.status(200).json({
      message: "Exam deleted successfully",
    });
  } catch (error) {
    console.error("Delete exam error:", error.message);

    res.status(500).json({
      message: "Server error while deleting exam",
    });
  }
});

module.exports = router;