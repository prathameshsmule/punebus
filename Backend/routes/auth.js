// routes/auth.js
import express from "express";
import { registerUser, adminLogin } from "../controllers/authController.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), "uploads", "docs");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".pdf";
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${file.fieldname}-${base}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
});

/**
 * POST /api/auth/register
 * Body fields (multipart/form-data):
 *   companyName,
 *   address,
 *   state,
 *   city,
 *   area,
 *   whatsappPhone,
 *   officeNumber?,
 *   gstNumber?,
 *   panNumber?,
 *   aadharNumber?,
 *   role,            // "driver" | "Bus vendor" | "mechanic" | "cleaner" | "restaurant" | "parcel" | "Dry Cleaner"
 *   aboutInfo?,
 *   bankAccountNumber?,
 *   ifscCode?,
 *   cancelCheque?,
 *   email?,
 *   password?,
 *   aadharPdf?      (file, PDF)
 *   bankPdf?        (file, PDF)
 *   certificatePdf? (file, PDF)
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
