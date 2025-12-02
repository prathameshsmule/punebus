// app.js  (Backend root me)

/**
 * Main Express server for PuneBus
 */

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import "express-async-errors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
// ✅ actual file ka naam enquiry.js hai
import enquiryRoutes from "./routes/enquiry.js";
import { errorHandler } from "./middleware/errorHandler.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

dotenv.config();

const app = express();

// CORS + JSON
app.use(cors());
app.use(express.json({ limit: "5mb" }));

// __dirname (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// uploads folder ensure + static serve
const uploadRoot = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

// ✅ LOCAL dev साठी थेट /uploads चालू ठेव
app.use("/uploads", express.static(uploadRoot));

// ✅ PRODUCTION साठी – कारण Hostinger फक्त /api proxy करतो
app.use("/api/uploads", express.static(uploadRoot));

// DB connect
connectDB(process.env.MONGO_URI || "mongodb://localhost:27017/Punebus");

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/enquiry", enquiryRoutes);

// health
app.get("/", (req, res) => {
  res.send("PuneBus Backend Running");
});

// error handler (last)
app.use(errorHandler);

// START SERVER on 5000 (or env PORT)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
