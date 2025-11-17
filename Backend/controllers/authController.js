import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// helper to sign token
const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// public registration for roles driver/vendor/mechanic/cleaner
export const registerUser = async (req, res) => {
  const { name, phone, email, role, AddharNo, address, documents } = req.body;

  if (!name || !phone || !role) {
    return res.status(400).json({ message: "name, phone and role are required" });
  }

  // disallow role 'admin' via public route
  if (role === "admin") {
    return res.status(403).json({ message: "Cannot register as admin via this route" });
  }

  const user = new User({
    name,
    phone,
    email: email || undefined,
    role,
    AddharNo,
    address,
    documents,
  });

  await user.save();
  res.status(201).json({ message: `${role} registered successfully`, user });
};

// admin login
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  const admin = await User.findOne({ email, role: "admin" });
  if (!admin) return res.status(401).json({ message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken(admin._id);
  res.json({ token, user: { id: admin._id, name: admin.name, email: admin.email } });
};
