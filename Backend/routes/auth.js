// routes/auth.js
import express from "express";
import { registerUser, adminLogin } from "../controllers/authController.js";

import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const router = express.Router();

/* ------------------- Multer setup for PDFs ------------------- */

// __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// uploads/docs folder
const uploadRoot = path.join(__dirname, "..", "uploads", "docs");
if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadRoot);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".pdf";
    const base = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "_")
      .toLowerCase();
    const ts = Date.now();
    cb(null, `${base}_${ts}${ext}`);
  },
});

const pdfOnly = (req, file, cb) => {
  if (file.mimetype !== "application/pdf") {
    return cb(new Error("Only PDF files are allowed"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter: pdfOnly,
});

/* ------------------- Routes ------------------- */

/**
 * POST /api/auth/register
 */
router.post(
  "/register",
  upload.fields([
    { name: "aadharPdf", maxCount: 1 },
    { name: "bankPdf", maxCount: 1 },
    { name: "certificatePdf", maxCount: 1 },
  ]),
  registerUser
);

/**
 * POST /api/auth/admin/login
 */
router.post("/admin/login", adminLogin);

export default router;
