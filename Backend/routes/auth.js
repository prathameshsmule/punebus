// routes/auth.js
import express from "express";
import { registerUser, adminLogin } from "../controllers/authController.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const router = express.Router();

// Multer setup for PDF uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype !== "application/pdf") {
    return cb(new Error("Only PDF files are allowed"));
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

/**
 * Middleware: uploaded PDFs se URL bana ke req.body me daal do
 * taaki authController.registerUser un URLs ko DB me save kar sake.
 */
const attachPdfUrls = (req, res, next) => {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    if (req.files?.aadharPdf?.[0]) {
      req.body.aadharPdfUrl = `${baseUrl}/uploads/${req.files.aadharPdf[0].filename}`;
    }
    if (req.files?.bankPdf?.[0]) {
      req.body.bankPdfUrl = `${baseUrl}/uploads/${req.files.bankPdf[0].filename}`;
    }
    if (req.files?.certificatePdf?.[0]) {
      req.body.certificatePdfUrl = `${baseUrl}/uploads/${req.files.certificatePdf[0].filename}`;
    }

    next();
  } catch (err) {
    console.error("attachPdfUrls error:", err);
    next(err);
  }
};

/**
 * POST /api/auth/register
 * Public registration (not admin)
 * Accepts multipart/form-data with 3 PDFs:
 *  - aadharPdf
 *  - bankPdf
 *  - certificatePdf
 */
router.post(
  "/register",
  upload.fields([
    { name: "aadharPdf", maxCount: 1 },
    { name: "bankPdf", maxCount: 1 },
    { name: "certificatePdf", maxCount: 1 },
  ]),
  attachPdfUrls,
  registerUser
);

/**
 * POST /api/auth/admin/login
 */
router.post("/admin/login", adminLogin);

export default router;
