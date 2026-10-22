const mongoose = require("mongoose");
require("dotenv").config();

async function checkRecords() {
  try {
    const mongoURI =
      process.env.MONGO_URI ||
      process.env.MONGODB_URI ||
      "mongodb://127.0.0.1:27017/coaching";

    await mongoose.connect(mongoURI);

    console.log("\nMongoDB connected successfully!\n");

    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();

    console.log("Available collections:");

    for (const collection of collections) {
      console.log("-", collection.name);
    }

    const namesToCheck = [
      "students",
      "users",
      "fees",
      "marks",
      "attendances",
      "studymaterials",
      "notices",
    ];

    for (const name of namesToCheck) {
      const exists = collections.some((c) => c.name === name);

      if (!exists) {
        console.log(`\n${name}: Collection not found`);
        continue;
      }

      const records = await mongoose.connection.db
        .collection(name)
        .find({})
        .limit(10)
        .toArray();

      console.log(`\n========== ${name.toUpperCase()} ==========`);
      console.log(`Total records: ${await mongoose.connection.db
        .collection(name)
        .countDocuments()}`);

      console.log(JSON.stringify(records, null, 2));
    }
  } catch (error) {
    console.error("Database error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("\nDatabase connection closed.");
  }
}

checkRecords();