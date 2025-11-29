// middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const STAFF_ROLES = ["manager", "accountant", "branchHead", "sales"];

export const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Not authorized, token invalid" });
  }
};

export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// ✅ NEW: admin ya staff (manager/accountant/branchHead/sales) dono ko allow
export const staffOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }

  const role = req.user.role;
  if (role === "admin" || STAFF_ROLES.includes(role)) {
    return next();
  }

  return res.status(403).json({ message: "Staff/admin access required" });
};
