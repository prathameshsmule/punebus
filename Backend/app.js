// app.js 
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import "express-async-errors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import enquiryRoutes from "./routes/enquiry.js";
import { errorHandler } from "./middleware/errorHandler.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs"; // NEW

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

// DB
connectDB(process.env.MONGO_URI || "mongodb://localhost:27017/Punebus");

// Resolve __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads folder exists
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// Serve uploaded files
app.use("/uploads", express.static(uploadsPath));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/enquiry", enquiryRoutes);

// health
app.get("/", (req, res) => res.send("PuneBus Backend Running"));

// error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
