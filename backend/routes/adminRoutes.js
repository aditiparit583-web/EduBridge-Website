const express = require("express");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");

const {
  authMiddleware,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// सर्व routes साठी Admin login आवश्यक
router.use(authMiddleware, adminOnly);

// Student साठी login account तयार करणे
router.post("/student-account", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email आणि password आवश्यक आहेत.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password किमान 8 अक्षरांचा असावा.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const student = await Student.findOne({
      email: normalizedEmail,
    });

    if (!student) {
      return res.status(404).json({
        message: "या Email चा Student profile सापडला नाही.",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "या Email साठी login account आधीच आहे.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: student.name,
      email: normalizedEmail,
      password: hashedPassword,
      role: "Student",
      isActive: true,
    });

    return res.status(201).json({
      message: "Student login account तयार झाले.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Student account error:", error);

    return res.status(500).json({
      message: "Student account तयार करता आले नाही.",
    });
  }
});

// Teacher साठी login account तयार करणे
router.post("/teacher-account", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email आणि password आवश्यक आहेत.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password किमान 8 अक्षरांचा असावा.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const teacher = await Teacher.findOne({
      email: normalizedEmail,
    });

    if (!teacher) {
      return res.status(404).json({
        message: "या Email चा Teacher profile सापडला नाही.",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "या Email साठी login account आधीच आहे.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: teacher.name,
      email: normalizedEmail,
      password: hashedPassword,
      role: "Teacher",
      isActive: true,
    });

    return res.status(201).json({
      message: "Teacher login account तयार झाले.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Teacher account error:", error);

    return res.status(500).json({
      message: "Teacher account तयार करता आले नाही.",
    });
  }
});

module.exports = router;