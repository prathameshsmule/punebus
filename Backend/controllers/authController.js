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
// PUBLIC REGISTRATION SAME
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

// ================================
// ✅ MULTI ROLE STAFF LOGIN
// ================================
export const adminLogin = async (req, res) => {
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
      role: user.role, // yahi baad me front pe use ho raha hai
    },
  });
};
