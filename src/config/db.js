const mongoose = require("mongoose");
require("dotenv").config(); // Load environment variables

const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME;

console.log("Mongo URL:", `${MONGO_URL}/${DB_NAME}`);

const dbConnection = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${MONGO_URL}/${DB_NAME}`
    );
    console.log(
      `MongoDB connected! DB Host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MongoDB connection failed!", error);
    process.exit(1);
  }
};

module.exports = dbConnection;
