console.log("AUTH ROUTES FILE LOADED:", __filename);
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");

const router = express.Router();
router.use((req, res, next) => {
  console.log("AUTH ROUTE HIT:", req.method, req.originalUrl);
  next();
});

// Test auth route
router.get("/test", (req, res) => {
  res.json({ message: "Auth routes are working" });
});

// Public registration: Parent accounts only
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        message: "Name, email and password are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "Parent",
      phone: phone || "",
      isActive: true,
    });

    return res.status(201).json({
      message:
        "Parent account created successfully. Ask the administrator to link your student.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    return res.status(500).json({
      message: "Server error during registration.",
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  console.log("LOGIN ROUTE REACHED");

  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in .env");

      return res.status(500).json({
        message: "Server authentication configuration error.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });
    console.log(
  "Teacher login check:",
  user ? {
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  } : "User not found"
);

    if (!user || !user.isActive) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }
   console.log("LOGIN EMAIL:", normalizedEmail);
   console.log("USER FOUND:", !!user, "ROLE:", user?.role);

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );
    console.log("PASSWORD MATCH:", isPasswordValid);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    let studentId = null;
    let teacherId = null;

    if (user.role === "Student") {
      const student = await Student.findOne({
        email: normalizedEmail,
      });

      if (!student) {
        return res.status(403).json({
          message:
            "Student profile not found. Please contact the administrator.",
        });
      }

      studentId = student._id;
    }

    if (user.role === "Parent") {
      const student = await Student.findOne({
        parentEmail: normalizedEmail,
      });

      if (!student) {
        return res.status(403).json({
          message:
            "No student is linked to this parent email. Please contact the administrator.",
        });
      }

      studentId = student._id;
    }

    if (user.role === "Teacher") {
      const teacher = await Teacher.findOne({
        email: normalizedEmail,
      });

      if (!teacher) {
        return res.status(403).json({
          message:
            "Teacher profile not found. Please contact the administrator.",
        });
      }

      teacherId = teacher._id;
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        studentId,
        teacherId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Server error during login.",
    });
  }
});

module.exports = router;