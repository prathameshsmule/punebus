// config/db.js
import mongoose from "mongoose";

export const connectDB = async (mongoURI) => {
  const uri = mongoURI || process.env.MONGO_URI || "mongodb://localhost:27017/Punebus";
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB connected:", uri.includes("mongodb+srv") ? "Atlas" : uri);
  } catch (err) {
    console.error("MongoDB connection error:", err.message || err);
    process.exit(1);
  }
};
