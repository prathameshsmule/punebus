// controllers/authController.js

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// ⚠️ Dhyaan: models/User.js me `export const User = ...` hona chahiye
import { User } from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

// -----------------------------
// POST /api/auth/register
// -----------------------------
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

      // ⭐ NEW: PDFs from frontend
      aadharPdfUrl,
      bankPdfUrl,
      certificatePdfUrl,
    } = req.body;

    if (!companyName || !whatsappPhone || !role) {
      return res
        .status(400)
        .json({ message: "companyName, whatsappPhone and role are required" });
    }

    let hashedPassword;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
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

      // ⭐ store PDF URLs in DB
      aadharPdfUrl,
      bankPdfUrl,
      certificatePdfUrl,
    });

    return res.status(201).json({
      message: "Registration successful",
      userId: user._id,
    });
  } catch (err) {
    console.error("registerUser error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// -----------------------------
// POST /api/auth/login  (normal user)
// -----------------------------
export const login = async (req, res) => {
  try {
    const { email, whatsappPhone, password } = req.body;

    if (!password || (!email && !whatsappPhone)) {
      return res
        .status(400)
        .json({ message: "Password and email or phone required" });
    }

    const query = email ? { email } : { whatsappPhone };
    const user = await User.findOne(query);
    if (!user || !user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        companyName: user.companyName,
        role: user.role,
        email: user.email,
        whatsappPhone: user.whatsappPhone,
      },
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// -----------------------------
// POST /api/auth/admin/login  (admin / staff login)
// -----------------------------
const STAFF_ROLES = ["admin", "manager", "accountant", "branch-head", "sales"];

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({
      email,
      role: { $in: STAFF_ROLES },
    });

    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Admin login successful",
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
      },
    });
  } catch (err) {
    console.error("adminLogin error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
