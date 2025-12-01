// controllers/adminController.js
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Subscription = require("../models/Subscription");
const Enquiry = require("../models/Enquiry");

// GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const total = await User.countDocuments();

    const users = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    const counts = {};
    users.forEach((u) => {
      counts[u._id] = u.count;
    });

    const enquiryCount = await Enquiry.countDocuments();
    const activeSubs = await Subscription.countDocuments({
      status: "active",
    });

    return res.json({
      total,
      counts,
      enquiries: enquiryCount,
      activeSubscriptions: activeSubs,
    });
  } catch (err) {
    console.error("getStats error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/admin/list/:role?search=&page=&limit=
exports.listUsers = async (req, res) => {
  try {
    const { role } = req.params;
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "10", 10);
    const search = (req.query.search || "").trim();

    const filter = {};
    if (role && role !== "all") {
      filter.role = role;
    }

    if (search) {
      filter.$or = [
        { companyName: new RegExp(search, "i") },
        { name: new RegExp(search, "i") },
        { whatsappPhone: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
        { city: new RegExp(search, "i") },
        { state: new RegExp(search, "i") },
        { area: new RegExp(search, "i") },
        { gstNumber: new RegExp(search, "i") },
        { panNumber: new RegExp(search, "i") },
        { aadharNumber: new RegExp(search, "i") },
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // ⭐ NOTE: `aadharPdfUrl`, `bankPdfUrl`, `certificatePdfUrl`
    // are already part of `users` because of schema

    return res.json({ users, total });
  } catch (err) {
    console.error("listUsers error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /api/admin/user   (Admin create partner or staff)
exports.createUserByAdmin = async (req, res) => {
  try {
    const {
      companyName,
      name,
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

      // ⭐ NEW PDF fields from admin UI
      aadharPdfUrl,
      bankPdfUrl,
      certificatePdfUrl,
    } = req.body;

    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    if (!companyName && !name) {
      return res
        .status(400)
        .json({ message: "companyName or name is required" });
    }

    let hashedPassword = undefined;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const user = await User.create({
      companyName: companyName || name,
      name,
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

      // ⭐ store pdf urls
      aadharPdfUrl,
      bankPdfUrl,
      certificatePdfUrl,
    });

    return res.status(201).json({
      message: "User created successfully",
      userId: user._id,
    });
  } catch (err) {
    console.error("createUserByAdmin error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/admin/user/:id
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // if password included, hash it
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    } else {
      delete updates.password;
    }

    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "User updated", user });
  } catch (err) {
    console.error("updateUser error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/admin/user/:id
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "User deleted" });
  } catch (err) {
    console.error("deleteUser error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// --------------------------
// Subscriptions
// --------------------------

// GET /api/admin/subscriptions?page=&limit=&search=
exports.listSubscriptions = async (req, res) => {
  try {
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "10", 10);
    const search = (req.query.search || "").trim();

    const filter = {};
    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { phone: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
        { plan: new RegExp(search, "i") },
      ];
    }

    const total = await Subscription.countDocuments(filter);
    const subscriptions = await Subscription.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.json({ subscriptions, total });
  } catch (err) {
    console.error("listSubscriptions error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /api/admin/subscription
exports.createSubscription = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      plan,
      durationMonths,
      startDate,
      endDate,
      status,
      notes,
    } = req.body;

    if (!name || !phone || !durationMonths || !startDate) {
      return res.status(400).json({
        message: "name, phone, durationMonths and startDate are required",
      });
    }

    const sub = await Subscription.create({
      name,
      phone,
      email,
      plan,
      durationMonths,
      startDate,
      endDate,
      status: status || "pending",
      notes,
    });

    return res
      .status(201)
      .json({ message: "Subscription created", subscription: sub });
  } catch (err) {
    console.error("createSubscription error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/admin/subscription/:id
exports.updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    const sub = await Subscription.findByIdAndUpdate(id, updates, {
      new: true,
    });
    if (!sub) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    return res.json({
      message: "Subscription updated",
      subscription: sub,
    });
  } catch (err) {
    console.error("updateSubscription error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/admin/subscription/:id
exports.deleteSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const sub = await Subscription.findByIdAndDelete(id);
    if (!sub) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    return res.json({ message: "Subscription deleted" });
  } catch (err) {
    console.error("deleteSubscription error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
