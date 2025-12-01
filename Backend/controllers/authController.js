// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Helper to sign token
const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// STAFF roles list (sirf admin create karega)
const STAFF_ROLES = ["manager", "accountant", "branchHead", "sales"];

// =========================
// PUBLIC REGISTRATION
// =========================
export const registerUser = async (req, res) => {
  try {
    const {
      companyName,
      address,
      state,
      city,
      area,
      whatsappPhone,
      officeNumber,
      gstNumber,
      panNumber,
      aadharNumber,
      role,
      aboutInfo,
      bankAccountNumber,
      ifscCode,
      cancelCheque,
      email,
      password,
    } = req.body;

    if (!companyName || !whatsappPhone || !role) {
      return res.status(400).json({
        message: "Company name, WhatsApp phone and role are required",
      });
    }

    // ❌ Public se admin/staff register nahi hone dena
    if (role === "admin" || STAFF_ROLES.includes(role)) {
      return res.status(403).json({
        message:
          "Cannot register as admin or staff via public route. Please contact admin.",
      });
    }

    // 🔹 Multer se aayi files (fields: aadharPdf, bankPdf, certificatePdf)
    const aadharFile = req.files?.aadharPdf?.[0];
    const bankFile = req.files?.bankPdf?.[0];
    const certFile = req.files?.certificatePdf?.[0];

    // Jo URL frontend use karega – /uploads se start
    const aadharPdfUrl = aadharFile
      ? `/uploads/docs/${aadharFile.filename}`
      : undefined;
    const bankPdfUrl = bankFile ? `/uploads/docs/${bankFile.filename}` : undefined;
    const certificatePdfUrl = certFile
      ? `/uploads/docs/${certFile.filename}`
      : undefined;

    let hashedPassword = undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const user = await User.create({
      companyName,
      address,
      state,
      city,
      area,
      whatsappPhone,
      officeNumber,
      gstNumber,
      panNumber,
      aadharNumber,
      role,
      aboutInfo,
      bankAccountNumber,
      ifscCode,
      cancelCheque,
      email: email || undefined,
      password: hashedPassword,

      // ⭐ yahan direct schema wale fields me save kar rahe hain
      aadharPdfUrl,
      bankPdfUrl,
      certificatePdfUrl,
    });

    return res.status(201).json({
      message: "Registration successful",
      user,
    });
  } catch (err) {
    console.error(err);

    if (err.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }

    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};
