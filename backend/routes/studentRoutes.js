const express = require("express");
const bcrypt = require("bcryptjs");

const Student = require("../models/Student");
const Batch = require("../models/Batch");
const User = require("../models/User");

const {
  authMiddleware,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Normalize names for case-insensitive comparison
const normalize = (value) =>
  String(value || "").trim().toLowerCase();

// Get batches assigned to the logged-in teacher
async function getTeacherBatches(teacherName) {
  const batches = await Batch.find().select("name teacherName");

  return batches.filter(
    (batch) =>
      normalize(batch.teacherName) === normalize(teacherName)
  );
}

// GET ALL STUDENTS
// Admin sees all students.
// Teacher sees students from assigned batches only.
router.get("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role === "Admin") {
      const students = await Student.find().sort({
        createdAt: -1,
      });

      return res.status(200).json(students);
    }

    if (req.user.role !== "Teacher") {
      return res.status(403).json({
        message: "You are not authorized to view students.",
      });
    }

    const teacherBatches = await getTeacherBatches(
      req.user.name
    );

    const batchNames = teacherBatches.map((batch) =>
      normalize(batch.name)
    );

    const allStudents = await Student.find().sort({
      createdAt: -1,
    });

    const students = allStudents.filter((student) =>
      batchNames.includes(normalize(student.batch))
    );

    return res.status(200).json(students);
  } catch (error) {
    console.error("Get students error:", error.message);

    return res.status(500).json({
      message: "Server error while fetching students.",
    });
  }
});

// GET SINGLE STUDENT
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found.",
      });
    }

    if (req.user.role === "Admin") {
      return res.status(200).json(student);
    }

    if (req.user.role !== "Teacher") {
      return res.status(403).json({
        message: "You are not authorized to view this student.",
      });
    }

    const teacherBatches = await getTeacherBatches(
      req.user.name
    );

    const hasAccess = teacherBatches.some(
      (batch) =>
        normalize(batch.name) === normalize(student.batch)
    );

    if (!hasAccess) {
      return res.status(403).json({
        message: "This student is not assigned to your batches.",
      });
    }

    return res.status(200).json(student);
  } catch (error) {
    console.error("Get student error:", error.message);

    return res.status(500).json({
      message: "Server error while fetching student.",
    });
  }
});

// ADD STUDENT
// Admin: creates Student profile AND Student login account.
// Teacher: creates Student profile only, within assigned batches.
router.post("/", authMiddleware, async (req, res) => {
  let createdUser = null;

  try {
    const {
      name,
      email,
      password,
      phone,
      parentName,
      parentPhone,
      parentEmail,
      dateOfBirth,
      gender,
      address,
      course,
      batch,
      admissionDate,
      status,
    } = req.body;

    // Validate name
    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Student name is required.",
      });
    }

    // Only Admin and Teacher may add students
    if (!["Admin", "Teacher"].includes(req.user.role)) {
      return res.status(403).json({
        message: "You are not authorized to add students.",
      });
    }

    // Normalize email
    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();

    // Validate teacher batch access
    if (req.user.role === "Teacher") {
      if (!batch || !String(batch).trim()) {
        return res.status(400).json({
          message: "Please select a batch.",
        });
      }

      const teacherBatches = await getTeacherBatches(
        req.user.name
      );

      const hasAccess = teacherBatches.some(
        (assignedBatch) =>
          normalize(assignedBatch.name) === normalize(batch)
      );

      if (!hasAccess) {
        return res.status(403).json({
          message:
            "You can add students only to your assigned batches.",
        });
      }
    }

    // Only Admin creates Student login accounts
    if (req.user.role === "Admin") {
      if (!normalizedEmail || !password) {
        return res.status(400).json({
          message:
            "Student email and password are required when Admin adds a student.",
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          message: "Password must be at least 8 characters.",
        });
      }

      // Do not allow duplicate login accounts
      const existingUser = await User.findOne({
        email: normalizedEmail,
      });

      if (existingUser) {
        return res.status(409).json({
          message:
            "An account with this email already exists. Please use a different email.",
        });
      }

      // Prevent duplicate student profiles
      const existingStudent = await Student.findOne({
        email: normalizedEmail,
      });

      if (existingStudent) {
        return res.status(409).json({
          message:
            "A student profile with this email already exists.",
        });
      }

      // Hash password before saving it
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create Student login account
      createdUser = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: "Student",
        phone: phone || "",
        isActive: true,
      });
    }

    // Create Student profile
    const student = await Student.create({
      name: name.trim(),
      email: normalizedEmail,
      phone,
      parentName,
      parentPhone,
      parentEmail: String(parentEmail || "")
        .trim()
        .toLowerCase(),
      dateOfBirth,
      gender,
      address,
      course,
      batch: String(batch || "").trim(),
      admissionDate,
      status,
    });

    return res.status(201).json({
      message:
        req.user.role === "Admin"
          ? "Student profile and login account created successfully."
          : "Student added successfully.",
      student,
    });
  } catch (error) {
    console.error("Add student error:", error.message);

    // If profile creation fails after creating the login account,
    // remove only the newly created account to avoid an orphaned account.
    if (createdUser) {
      try {
        await User.deleteOne({ _id: createdUser._id });
      } catch (cleanupError) {
        console.error(
          "Student account cleanup error:",
          cleanupError.message
        );
      }
    }

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "This email is already registered. Please check the email address.",
      });
    }

    return res.status(500).json({
      message: "Server error while adding student.",
    });
  }
});

// UPDATE STUDENT — Admin only
router.put("/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Normalize emails
    if (updateData.parentEmail !== undefined) {
      updateData.parentEmail = String(updateData.parentEmail || "")
        .trim()
        .toLowerCase();
    }

    if (updateData.email !== undefined) {
      updateData.email = String(updateData.email || "")
        .trim()
        .toLowerCase();
    }

    // Update Student login password only when a new password is provided
    if (updateData.password !== undefined) {
      const newPassword = String(updateData.password || "").trim();

      // Empty password means keep the existing password
      if (!newPassword) {
        delete updateData.password;
      } else {
        if (newPassword.length < 8) {
          return res.status(400).json({
            message: "Password must be at least 8 characters long.",
          });
        }

        const StudentUser = require("../models/User");
        const bcrypt = require("bcryptjs");

        const student = await Student.findById(req.params.id);

        if (!student) {
          return res.status(404).json({
            message: "Student not found.",
          });
        }

        const studentEmail = String(student.email || "")
          .trim()
          .toLowerCase();

        if (!studentEmail) {
          return res.status(400).json({
            message: "Student email is required to update the login password.",
          });
        }

        const studentUser = await StudentUser.findOne({
          email: studentEmail,
          role: "Student",
        });

        if (!studentUser) {
          return res.status(404).json({
            message: "Student login account not found.",
          });
        }

        studentUser.password = await bcrypt.hash(newPassword, 10);
        await studentUser.save();
        console.log("STUDENT PASSWORD UPDATED:", studentUser.email);
        await studentUser.save();

        delete updateData.password;
      }
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!student) {
      return res.status(404).json({
        message: "Student not found.",
      });
    }

    return res.status(200).json({
      message: "Student updated successfully.",
      student,
    });
  } catch (error) {
    console.error("Update student error:", error.message);

    return res.status(500).json({
      message: "Server error while updating student.",
    });
  }
});
// DELETE STUDENT — Admin only
router.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found.",
      });
    }

    return res.status(200).json({
      message: "Student deleted successfully.",
    });
  } catch (error) {
    console.error("Delete student error:", error.message);

    return res.status(500).json({
      message: "Server error while deleting student.",
    });
  }
});

module.exports = router;