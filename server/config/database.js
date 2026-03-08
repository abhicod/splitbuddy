import mongoose from "mongoose";
import dotenv from "dotenv";

// Load env vars
dotenv.config({ path: ".env" });

const mongoURI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongoURI);

    // MongoDB connected
  } catch (error) {
    console.error(
      "Error connecting to MongoDB:",
      error.message,
      process.env.MONGODB_URI
    );
    process.exit(1);
  }
};

export default connectDB;
