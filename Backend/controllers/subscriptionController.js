// controllers/subscriptionController.js
import Subscription from "../models/Subscription.js";

// same helper functions as before
const PLAN_DURATION_OPTIONS = {
  Gold: [3, 6, 12],
  Silver: [1, 3, 6],
  Platinum: [6, 12],
};

const computeEndDate = (startDate, months) => {
  if (!startDate || !months) return undefined;
  const sd = new Date(startDate);
  sd.setMonth(sd.getMonth() + parseInt(months));
  return sd;
};

const validatePlanAndDuration = (plan, durationMonths) => {
  if (!plan || !PLAN_DURATION_OPTIONS[plan])
    return { ok: false, message: "Invalid plan" };
  const allowed = PLAN_DURATION_OPTIONS[plan];
  if (!allowed.includes(parseInt(durationMonths))) {
    return {
      ok: false,
      message: `Invalid duration for ${plan}. Allowed: ${allowed.join(", ")}`,
    };
  }
  return { ok: true };
};

// ✅ CREATE (admin + sales)
//  - sales: status ALWAYS "pending"
//  - admin: default "active" (ya jo status body me bheje, agar valid ho)
export const createSubscriptionByAdmin = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      plan = "Gold",
      durationMonths,
      startDate,
      endDate: suppliedEnd,
      status, // admin ke liye optional
      notes,
    } = req.body;

    if (!name || !phone || !durationMonths || !startDate) {
      return res
        .status(400)
        .json({ message: "name, phone, durationMonths and startDate required" });
    }

    const planCheck = validatePlanAndDuration(plan, durationMonths);
    if (!planCheck.ok)
      return res.status(400).json({ message: planCheck.message });

    const role = req.user?.role;

    let finalStatus;

    if (role === "sales") {
      // ✅ sales user hamesha pending hi create karega
      finalStatus = "pending";
    } else {
      // admin / others ke liye, agar body me valid status hai to use karo
      const allowed = ["pending", "active", "inactive", "expired"];
      if (status && allowed.includes(status)) {
        finalStatus = status;
      } else {
        // default admin ke liye active
        finalStatus = "active";
      }
    }

    const endDate = suppliedEnd
      ? new Date(suppliedEnd)
      : computeEndDate(startDate, durationMonths);

    const subscription = new Subscription({
      name,
      phone,
      email,
      plan,
      durationMonths: parseInt(durationMonths),
      startDate: new Date(startDate),
      endDate,
      status: finalStatus,
      notes,
      createdBy: req.user?._id,
    });

    await subscription.save();

    return res
      .status(201)
      .json({ message: "Subscription created", subscription });
  } catch (err) {
    console.error("[createSubscriptionByAdmin] error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ LIST
//  - admin / manager / accountant / branch-head: sab subscriptions dekh sakte
//  - sales: sirf apne banaye hue (createdBy = current user)
export const listSubscriptions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      plan,
      status,
      sort = "createdAt",
      order = "desc",
    } = req.query;

    const q = {};

    if (search) {
      q.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (plan) q.plan = plan;
    if (status) q.status = status;

    // ✅ sales ke liye apne hi records
    if (req.user?.role === "sales") {
      q.createdBy = req.user._id;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Subscription.countDocuments(q);
    const subs = await Subscription.find(q)
      .sort({ [sort]: order === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      subscriptions: subs,
    });
  } catch (err) {
    console.error("[listSubscriptions] error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
