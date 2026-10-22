require("dotenv").config();

const mongoose = require("mongoose");
const Student = require("./models/Student");

async function linkParent() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const student = await Student.findOne({
      email: "rutuja@gmail.com",
    });

    if (!student) {
      console.log("Student not found!");
      return;
    }

    student.parentEmail = "parent.test@example.com";

    await student.save();

    console.log("Parent linked successfully!");
    console.log("Student:", student.name);
    console.log("Student Email:", student.email);
    console.log("Parent Email:", student.parentEmail);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

linkParent();