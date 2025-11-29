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

    // ❌ Public route se admin ya staff roles register NHI honge
    if (role === "admin" || STAFF_ROLES.includes(role)) {
      return res.status(403).json({
        message:
          "Cannot register as admin or staff via public route. Please contact admin.",
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
// ADMIN + STAFF LOGIN (admin, manager, accountant, branchHead, sales)
// Body: { email, password, role }
// =====================================================
export const adminLogin = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // body se aaya role; default admin
    const requestedRole = (role || "admin").trim();

    const ALLOWED_ROLES = ["admin", ...STAFF_ROLES];

    // koi aur role se login ki koshish kare to block
    if (!ALLOWED_ROLES.includes(requestedRole)) {
      return res.status(403).json({ message: "Invalid role for staff login" });
    }

    // ab email + role dono match hone chahiye
    const user = await User.findOne({ email, role: requestedRole });

    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
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
        role: user.role, // yahi real role hai jisse frontend redirect karega
      },
    });
  } catch (err) {
    console.error("[adminLogin] error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};
