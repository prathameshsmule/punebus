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

// ✅ NEW: Helper to build base URL for file links
const getBaseUrl = (req) => {
  // If you set this in .env (recommended):
  // BACKEND_BASE_URL=https://your-backend-domain.com
  if (process.env.BACKEND_BASE_URL) {
    // remove trailing slash if any
    return process.env.BACKEND_BASE_URL.replace(/\/+$/, "");
  }

  // fallback – works on localhost or simple deployments
  return `${req.protocol}://${req.get("host")}`;
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

    // 🔹 Multer se aayi files (routes/auth.js me upload.fields laga hai)
    const aadharFile = req.files?.aadharPdf?.[0];
    const bankFile = req.files?.bankPdf?.[0];
    const certFile = req.files?.certificatePdf?.[0];

    // ✅ NEW: base URL banaya
    const baseUrl = getBaseUrl(req);

    // ✅ Ye URLs ab FULL absolute honge (e.g. https://api.punebus.com/uploads/docs/xyz.pdf)
    const aadharPdfUrl = aadharFile
      ? `${baseUrl}/uploads/docs/${aadharFile.filename}`
      : undefined;
    const bankPdfUrl = bankFile
      ? `${baseUrl}/uploads/docs/${bankFile.filename}`
      : undefined;
    const certificatePdfUrl = certFile
      ? `${baseUrl}/uploads/docs/${certFile.filename}`
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

      aadharPdfUrl,
      bankPdfUrl,
      certificatePdfUrl,
    });

    return res.status(201).json({
      message: "Registration successful",
      user,
    });
  } catch (err) {
    console.error("[registerUser] error:", err);

    if (err.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }

    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// ================================
// ✅ MULTI ROLE STAFF LOGIN
// ================================
export const adminLogin = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Email, password and role are required" });
    }

    // Frontend se branch-head aa raha ho to normalize
    let normalizedRole = role;
    if (normalizedRole === "branch-head") normalizedRole = "branchHead";

    const allowedRoles = ["admin", "manager", "accountant", "branchHead", "sales"];

    if (!allowedRoles.includes(normalizedRole)) {
      return res.status(403).json({ message: "Invalid role selection" });
    }

    // Ab specific role ke saath user dhoondho
    const user = await User.findOne({ email, role: normalizedRole });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user._id);

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name || user.companyName || "",
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("[adminLogin] error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
