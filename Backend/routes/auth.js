// routes/auth.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { registerUser, adminLogin } from "../controllers/authController.js";

const router = express.Router();

/* ---------- Multer setup for PDF uploads ---------- */

// compute __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ensure upload folder exists
const uploadDir = path.join(__dirname, "..", "uploads", "docs");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".pdf";
    const safeName =
      file.fieldname +
      "-" +
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      ext;
    cb(null, safeName);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

/**
 * POST /api/auth/register
 * Body (multipart/form-data):
 *  - all existing fields (companyName, address, ... etc)
 *  - aadharPdf (PDF file)
 *  - bankPdf (PDF file)
 *  - certificatePdf (PDF file)
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
 * Body: { email, password, role }
 */
router.post("/admin/login", adminLogin);

export default router;
