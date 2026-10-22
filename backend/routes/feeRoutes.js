const express = require("express");
const mongoose = require("mongoose");
const Fee = require("../models/Fee");
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
      return res.json(await Fee.find().sort({ createdAt: -1 }));
    }

    if (!["Parent", "Student"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const students = await getLinkedStudents(req.user);

    if (!students.length) {
      return res.json([]);
    }

    const ids = students.map(student => student._id);
    const names = students.map(student => student.name);

    const fees = await Fee.find({
      $or: [
        { studentId: { $in: ids } },
        { studentName: { $in: names } }
      ]
    }).sort({ createdAt: -1 });

    return res.json(fees);
  } catch (error) {
    console.error("Fee fetch error:", error);
    return res.status(500).json({
      message: "Failed to fetch fee records"
    });
  }
});

router.post("/", authMiddleware, staffOnly, async (req, res) => {
  try {
    const {
      studentId,
      studentName,
      course,
      totalAmount,
      paidAmount,
      paymentDate,
      paymentMode,
      remarks
    } = req.body;

    if (
      !studentName ||
      !course ||
      totalAmount === undefined ||
      paidAmount === undefined
    ) {
      return res.status(400).json({
        message: "Required fee fields are missing"
      });
    }

    const total = Number(totalAmount);
    const paid = Number(paidAmount);

    if (
      !Number.isFinite(total) ||
      !Number.isFinite(paid) ||
      total < 0 ||
      paid < 0 ||
      paid > total
    ) {
      return res.status(400).json({
        message: "Invalid fee amounts"
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

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    const due = total - paid;
    const status = due === 0 ? "Paid" : paid > 0 ? "Partial" : "Pending";

    const fee = await Fee.create({
      studentId: student._id,
      studentName: student.name,
      course: course.trim(),
      totalAmount: total,
      paidAmount: paid,
      dueAmount: due,
      paymentDate: paymentDate || undefined,
      paymentMode: paymentMode || "Cash",
      status,
      remarks: remarks || ""
    });

    return res.status(201).json(fee);
  } catch (error) {
    console.error("Fee create error:", error);
    return res.status(500).json({
      message: "Failed to create fee record"
    });
  }
});

router.put("/:id", authMiddleware, staffOnly, async (req, res) => {
  try {
    const { totalAmount, paidAmount } = req.body;

    const total = Number(totalAmount);
    const paid = Number(paidAmount);

    if (
      !Number.isFinite(total) ||
      !Number.isFinite(paid) ||
      total < 0 ||
      paid < 0 ||
      paid > total
    ) {
      return res.status(400).json({
        message: "Invalid fee amounts"
      });
    }

    const due = total - paid;
    const status = due === 0 ? "Paid" : paid > 0 ? "Partial" : "Pending";

    const fee = await Fee.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        totalAmount: total,
        paidAmount: paid,
        dueAmount: due,
        status
      },
      { new: true, runValidators: true }
    );

    if (!fee) {
      return res.status(404).json({
        message: "Fee record not found"
      });
    }

    return res.json(fee);
  } catch (error) {
    console.error("Fee update error:", error);
    return res.status(500).json({
      message: "Failed to update fee record"
    });
  }
});

router.delete("/:id", authMiddleware, staffOnly, async (req, res) => {
  try {
    const fee = await Fee.findByIdAndDelete(req.params.id);

    if (!fee) {
      return res.status(404).json({
        message: "Fee record not found"
      });
    }

    return res.json({
      message: "Fee record deleted successfully"
    });
  } catch (error) {
    console.error("Fee delete error:", error);
    return res.status(500).json({
      message: "Failed to delete fee record"
    });
  }
});

module.exports = router;