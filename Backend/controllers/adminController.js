// controllers/adminController.js
import bcrypt from "bcryptjs";
import User from "../models/User.js";

/**
 * ADMIN: Create user
 * - Supports OLD fields: name, phone, AddharNo, address, documents
 * - Supports NEW fields: companyName, whatsappPhone, etc.
 * - Frontend agar name/phone bheje ya companyName/whatsappPhone,
 *   dono case me user create ho jayega.
 */
export const createUserByAdmin = async (req, res) => {
  try {
    const {
      // OLD fields
      name,
      phone,
      AddharNo,
      address,
      documents,

      // NEW fields
      companyName,
      state,
      city,
      area,
      whatsappPhone,
      officeNumber,
      gstNumber,
      panNumber,
      aadharNumber,
      aboutInfo,
      bankAccountNumber,
      ifscCode,
      cancelCheque,

      // common
      email,
      role,
      password,
    } = req.body;

    // compat: allow either (name OR companyName) + (phone OR whatsappPhone)
    const finalName = name || companyName;
    const finalPhone = phone || whatsappPhone;

    if (!finalName || !finalPhone || !role) {
      return res.status(400).json({
        message: "name / company, phone / WhatsApp and role required",
      });
    }

    // prevent creating duplicate email if provided
    if (email) {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ message: "Email already in use" });
      }
    }

    // hash password if provided
    let hashed = undefined;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashed = await bcrypt.hash(password, salt);
    }

    const user = await User.create({
      // OLD
      name: finalName,
      phone: finalPhone,
      AddharNo,
      address,
      documents,

      // mirror to NEW fields too so future UI me consistent rahe
      companyName: companyName || finalName,
      whatsappPhone: whatsappPhone || finalPhone,
      state,
      city,
      area,
      officeNumber,
      gstNumber,
      panNumber,
      aadharNumber: aadharNumber || AddharNo,
      aboutInfo,
      bankAccountNumber,
      ifscCode,
      cancelCheque,

      email: email || undefined,
      role,
      password: hashed,
    });

    return res
      .status(201)
      .json({ message: "User created by admin", user });
  } catch (err) {
    console.error("[createUserByAdmin] error:", err);
    return res.status(500).json({
      message: "Server Error",
      error: process.env.NODE_ENV === "production" ? undefined : err.message,
    });
  }
};

/** listByCategory — same as your old working code */
export const listByCategory = async (req, res) => {
  const role = req.params.role; // driver, vendor, mechanic, cleaner, admin
  const { page = 1, limit = 20, search } = req.query;

  const query = {};
  if (role && role !== "all") query.role = role;

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { companyName: { $regex: search, $options: "i" } }, // new
      { whatsappPhone: { $regex: search, $options: "i" } }, // new
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  res.json({
    role: role || "all",
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    users,
  });
};

/** mechanicList wrapper */
export const mechanicList = async (req, res) => {
  req.params.role = "mechanic";
  return listByCategory(req, res);
};

/** get counts per role and totals */
export const getStats = async (req, res) => {
  const roles = ["driver", "vendor", "mechanic", "cleaner", "admin", "restaurant", "parcel"];
  const counts = {};

  const promises = roles.map(async (r) => {
    const c = await User.countDocuments({ role: r });
    counts[r] = c;
  });
  await Promise.all(promises);

  const total = await User.countDocuments({});
  res.json({ total, counts });
};

/** get single user by id */
export const getUserById = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "User id required" });

  const user = await User.findById(id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({ user });
};

/** update user by admin */
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };

  if (updates.email) {
    const existing = await User.findOne({
      email: updates.email,
      _id: { $ne: id },
    });
    if (existing)
      return res.status(409).json({ message: "Email already in use" });
  }

  if (updates.password) {
    const salt = await bcrypt.genSalt(10);
    updates.password = await bcrypt.hash(updates.password, salt);
  } else {
    delete updates.password;
  }

  const user = await User.findByIdAndUpdate(id, updates, {
    new: true,
  }).select("-password");

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({ message: "User updated", user });
};

/** delete user */
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findByIdAndDelete(id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ message: "User deleted" });
};
