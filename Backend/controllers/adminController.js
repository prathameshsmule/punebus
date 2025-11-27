// controllers/adminController.js
import bcrypt from "bcryptjs";
import User from "../models/User.js";

/** ADMIN: create user (supports old + new fields) */
export const createUserByAdmin = async (req, res) => {
  try {
    const {
      // old fields
      name,
      phone,
      AddharNo,
      address,
      documents,

      // new fields
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

    // Create user with BOTH old + new structure
    const user = await User.create({
      // old fields
      name: finalName,
      phone: finalPhone,
      AddharNo,
      address,
      documents,

      // new fields (mirror)
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
