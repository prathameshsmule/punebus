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
// PUBLIC REGISTRATION (driver, vendor, mechanic, etc.)
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

    // Validate important required fields
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

    // Hash password if provided (optional)
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

    // Duplicate email
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// =====================================================
// ADMIN LOGIN
// =====================================================
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  // Verify admin
  const admin = await User.findOne({ email, role: "admin" });
  if (!admin) return res.status(401).json({ message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch)
    return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken(admin._id);

  res.json({
    token,
    user: {
      id: admin._id,
      companyName: admin.companyName,
      email: admin.email,
    },
  });
};
