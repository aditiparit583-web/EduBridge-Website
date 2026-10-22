const mongoose = require("mongoose");

const studyMaterialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    course: {
      type: String,
      required: true,
      trim: true,
    },

    batch: {
     type: String,
     trim: true,
     default: "",
    },

    materialType: {
      type: String,
      enum: ["PDF", "Video", "Notes", "Assignment", "Other"],
      default: "Notes",
    },

    description: {
      type: String,
      trim: true,
    },

    materialLink: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudyMaterial", studyMaterialSchema);