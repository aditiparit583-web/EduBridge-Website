const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    noticeDate: {
      type: Date,
      required: true,
    },

    audience: {
      type: String,
      enum: ["All", "Students", "Teachers", "Parents"],
      default: "All",
    },

    // Notice कोणासाठी आहे?
    targetType: {
      type: String,
      enum: ["General", "Course", "Batch", "Individual"],
      default: "General",
    },

    course: {
      type: String,
      trim: true,
      default: "",
    },

    batch: {
      type: String,
      trim: true,
      default: "",
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      default: null,
      index: true,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notice", noticeSchema);