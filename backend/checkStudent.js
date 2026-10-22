const mongoose = require("mongoose");
require("dotenv").config();

const Student = require("./models/Student");

async function checkStudent() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const students = await Student.find({
      name: { $regex: "Rutuja", $options: "i" }
    }).select("name email phone course batch status");

    console.log("Rutuja student records:", students);

    if (students.length === 0) {
      console.log("Rutuja नावाची Student नोंद सापडली नाही.");
    }
  } catch (error) {
    console.error("Check error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkStudent();