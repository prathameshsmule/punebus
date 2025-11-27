// controllers/adminController.js
import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const createUserByAdmin = async (req, res) => {
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

    // REQUIRED FIELDS CHECK
    if (!companyName || !whatsappPhone || !role) {
      return res.status(400).json({
        message: "Company name, WhatsApp phone and role are required",
      });
    }

    // Prevent creating admin accidentally
    if (role === "admin") {
      return res
        .status(403)
        .json({ message: "Cannot create admin user from here" });
    }

    // Email duplicate check
    if (email) {
      const exist = await User.findOne({ email });
      if (exist)
        return res.status(409).json({ message: "Email already in use" });
    }

    // Hash password if added
    let hashedPassword = undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Create new user
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

    return res
      .status(201)
      .json({ message: "User created successfully", user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};
