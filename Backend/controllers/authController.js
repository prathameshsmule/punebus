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

// =====================================================
// PUBLIC REGISTRATION (NEW FORMAT)
// =====================================================

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

    // Validate required fields
    if (!companyName || !whatsappPhone || !role) {
      return res.status(400).json({
        message: "Company name, WhatsApp phone and role are required",
      });
    }

    // Prevent public admin signup
    if (role === "admin") {
      return res.status(403).json({
        message: "Cannot register as admin via public route",
      });
    }

    // Hash password if provided
    let hashedPassword = undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Create user
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

// =====================================================
// ADMIN LOGIN (OLD SYSTEM — SAME AS BEFORE)
// =====================================================

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  // OLD admin format: name, email, password, role: "admin"
  const admin = await User.findOne({ email, role: "admin" });

  if (!admin) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({
    token,
    user: {
      id: admin._id,
      name: admin.name, // OLD NAME SUPPORT
      email: admin.email,
      role: admin.role,
    },
  });
};
