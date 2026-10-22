const express = require("express");
const bcrypt = require("bcryptjs");

const Teacher = require("../models/Teacher");
const User = require("../models/User");

const router = express.Router();

// Get all teachers
router.get("/", async (req, res) => {
  try {
    const teachers = await Teacher.find().sort({ createdAt: -1 });

    return res.status(200).json(teachers);
  } catch (error) {
    console.error("Get teachers error:", error.message);

    return res.status(500).json({
      message: "Server error while fetching teachers.",
    });
  }
});

// Get a single teacher
router.get("/:id", async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({
        message: "Teacher not found.",
      });
    }

    return res.status(200).json(teacher);
  } catch (error) {
    console.error("Get teacher error:", error.message);

    return res.status(500).json({
      message: "Server error while fetching teacher.",
    });
  }
});

// Add a teacher and create the corresponding login account
router.post("/", async (req, res) => {
  let createdUserId = null;

  try {
    const {
      name,
      email,
      password,
      phone,
      subject,
      qualification,
      experience,
      address,
      joiningDate,
      status,
    } = req.body;

    if (!name?.trim() || !subject?.trim()) {
      return res.status(400).json({
        message: "Teacher name and subject are required.",
      });
    }

    if (!email?.trim()) {
      return res.status(400).json({
        message: "Teacher email is required.",
      });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check whether the email already exists in the User collection
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    // Check whether a teacher profile already exists
    const existingTeacher = await Teacher.findOne({
      email: normalizedEmail,
    });

    if (existingTeacher) {
      return res.status(409).json({
        message: "A teacher profile with this email already exists.",
      });
    }

    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the login account
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "Teacher",
      phone: phone || "",
      isActive: status !== "Inactive",
    });

    createdUserId = user._id;

    // Create the teacher profile
    const teacher = await Teacher.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone || "",
      subject: subject.trim(),
      qualification,
      experience:
        experience !== undefined &&
        experience !== null &&
        experience !== ""
          ? Number(experience)
          : undefined,
      address,
      joiningDate: joiningDate || undefined,
      status: status || "Active",
    });

    return res.status(201).json({
      message: "Teacher and login account created successfully.",
      teacher,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Add teacher error:", error.message);

    // Remove the newly created login account if profile creation fails
    if (createdUserId) {
      try {
        await User.findByIdAndDelete(createdUserId);
      } catch (cleanupError) {
        console.error(
          "Login account cleanup error:",
          cleanupError.message
        );
      }
    }

    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    return res.status(500).json({
      message: "Server error while adding teacher.",
    });
  }
});

// Update teacher details
router.put("/:id", async (req, res) => {
  console.log("TEACHER UPDATE ROUTE REACHED");
  try {
   const {
name,
email,
password,
phone,
subject,
qualification,
experience,
address,
joiningDate,
status,
} = req.body;
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({
        message: "Teacher not found.",
      });
    }

    const normalizedEmail = email?.trim().toLowerCase();

    if (!name?.trim() || !subject?.trim()) {
      return res.status(400).json({
        message: "Teacher name and subject are required.",
      });
    }

    if (!normalizedEmail) {
      return res.status(400).json({
        message: "Teacher email is required.",
      });
    }

    // Check whether another teacher is using this email
    const duplicateTeacher = await Teacher.findOne({
      email: normalizedEmail,
      _id: { $ne: teacher._id },
    });

    if (duplicateTeacher) {
      return res.status(409).json({
        message: "Another teacher already uses this email.",
      });
    }

    // Check whether another account is using this email
    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: (await User.findOne({
        email: teacher.email?.trim().toLowerCase(),
        role: "Teacher",
      }))?._id },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "This email is already used by another account.",
      });
    }

    const oldEmail = teacher.email?.trim().toLowerCase();

    teacher.name = name.trim();
    teacher.email = normalizedEmail;
    teacher.phone = phone || "";
    teacher.subject = subject.trim();
    teacher.qualification = qualification || "";
    teacher.experience =
      experience !== undefined &&
      experience !== null &&
      experience !== ""
        ? Number(experience)
        : undefined;
    teacher.address = address || "";

    if (joiningDate) {
      teacher.joiningDate = joiningDate;
    }

    if (status) {
      teacher.status = status;
    }

    await teacher.save();

    // Update the existing teacher login account, if available
    let user = await User.findOne({
  email: oldEmail,
  role: "Teacher",
});

if (!user) {
  user = await User.findOne({
    email: normalizedEmail,
    role: "Teacher",
  });
}

if (!user) {
  return res.status(404).json({
    message:
      "Teacher login account not found. Please contact the administrator.",
  });
}

user.name = name.trim();
user.email = normalizedEmail;
user.phone = phone || "";
user.isActive = teacher.status !== "Inactive";

if (password && password.trim()) {
  if (password.length < 8) {
    return res.status(400).json({
      message: "Password must contain at least 8 characters.",
    });
  }

  user.password = await bcrypt.hash(password, 10);
}

await user.save();

console.log("Teacher account updated:", user.email);

    return res.status(200).json({
      message: "Teacher updated successfully.",
      teacher,
    });
  } catch (error) {
    console.error("Update teacher error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "This email is already used by another account.",
      });
    }

    return res.status(500).json({
      message: "Server error while updating teacher.",
    });
  }
});

// Delete a teacher profile
router.delete("/:id", async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);

    if (!teacher) {
      return res.status(404).json({
        message: "Teacher not found.",
      });
    }

    return res.status(200).json({
      message: "Teacher profile deleted successfully.",
    });
  } catch (error) {
    console.error("Delete teacher error:", error.message);

    return res.status(500).json({
      message: "Server error while deleting teacher.",
    });
  }
});

module.exports = router;