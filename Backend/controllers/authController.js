// controllers/authController.js
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

/**
 * POST /api/auth/register
 * Normal user / partner registration
 */
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

      // ⭐ PDFs URLs (middleware se aate hain)
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

/**
 * POST /api/auth/login
 * Normal user login (email OR whatsappPhone + password)
 */
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

/**
 * POST /api/auth/admin/login
 * Sirf admin / staff roles ko allow karega
 */
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Jo roles tum admin dashboard me use kar rahe ho:
    const STAFF_ROLES = ["admin", "manager", "accountant", "branch-head", "sales"];

    const user = await User.findOne({
      email,
      role: { $in: STAFF_ROLES },
    });

    if (!user || !user.password) {
      return res.status(400).json({ message: "Invalid admin credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid admin credentials" });
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
        companyName: user.companyName,
        role: user.role,
        email: user.email,
        whatsappPhone: user.whatsappPhone,
      },
    });
  } catch (err) {
    console.error("adminLogin error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
